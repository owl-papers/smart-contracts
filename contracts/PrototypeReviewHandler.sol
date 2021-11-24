// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./Articles.sol";

/**
 * @title A contract that handles who will be reviewing a paper
 * @author Pedro Henrique Bufulin de Almeida
 * @notice  A paper author deploys this contract.
 * It uses chainlink VRF to handle randomization of selected reviewers.
 * Reviewers call the joinAsReviewer function to have a chance to be elegible for a right to review.
 * @custom:experimental This is an experimental contract.
 */
contract PrototypeReviewHandler is VRFConsumerBase, Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;
    bytes32 private sKeyhash;
    uint256 private sFee;
    uint256 public randomValue;
    uint256 public reward;
    uint256 public individualReward;
    address[] public selectedReviewers;
    EnumerableSet.AddressSet private possibleReviewers;
    Paper public paper;
    Paper[] public reviewPapers;
    ExecutionState public currentState;
    PaidState public currentPaidState;
    ValidateRandom public isvalid;
    address[] public sentReviews;
    mapping(address => bool) public hasSubmited;
    mapping(address => bool) public hasClaimed;

    event Transfer(address sender, address receiver, uint256 amount);
    event Deposit(address sender, uint256 amount);

    struct Paper {
        address nft;
        uint256 tokenId;
    }

    enum ValidateRandom {
        valid,
        invalid
    }

    enum ExecutionState {
        WAITING_FOR_START,
        STARTED,
        FINISEHD
    }

    enum PaidState {
        notPaid,
        Paid
    }

    /**
     * @notice Constructor inherits VRFConsumerBase
     *
     * @dev NETWORK: MUMBAI
     * @dev   Chainlink VRF Coordinator address: 0x8C7382F9D8f56b33781fE506E897a4F1e2d17255
     * @dev   LINK token address:                0x326C977E6efc84E512bB9C30f76E30c160eD06FB
     * @dev   Key Hash:   0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4
     * @dev   Fee:        0.0001 LINK (100000000000000)
     *
     * @param vrfCoordinator address of the VRF Coordinator
     * @param link address of the LINK token
     * @param keyHash bytes32 representing the hash of the VRF job
     * @param fee uint256 fee to pay the VRF oracle
     */

    constructor(
        address vrfCoordinator,
        address link,
        bytes32 keyHash,
        uint256 fee
    ) VRFConsumerBase(vrfCoordinator, link) {
        sKeyhash = keyHash;
        sFee = fee; // 0.1 LINK (Varies by network)
        isvalid = ValidateRandom.invalid;
        currentState = ExecutionState.WAITING_FOR_START;
        currentPaidState = PaidState.notPaid;
    }

    /**
     * @dev restricts a funcition to only the selected reviewers
     */
    modifier onlySelectedReviewers() {
        bool isSelected = false;
        for (uint256 i = 0; i < selectedReviewers.length; i++) {
            if (selectedReviewers[i] == msg.sender) {
                isSelected = true;
                break;
            }
        }

        require(isSelected, "reviewer not in selected reviewers");
        _;
    }

    /**
     * @dev restricts function to only the creator of an NFT Paper.
     */
    modifier onlyCreator(address _nftContract, uint256 _tokenId) {
        Articles articles = Articles(_nftContract);
        address creator = articles.creators(_tokenId);
        require(creator == msg.sender, "only the creator can send a review");
        _;
    }

    /**
     * @notice sets the reward that will be disributed equally among reviewers.
     * @dev I decided to make this function public beacause maybe someone else also has interest
     * in the paper that is being reviwed. So they can also send some value as an incentive
     */
    function accReward() public payable {
        require(msg.value > 0, "some value is needed");
        require(
            currentState == ExecutionState.WAITING_FOR_START,
            "not Waiting for start state"
        );
        reward += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @notice sets the paper to be reviewed
     * @param _nftContract address to the Article ERC1155
     * @param _tokenId Id of the paper in the contract
     */
    function setPaperToReview(address _nftContract, uint256 _tokenId)
        public
        onlyOwner
        onlyCreator(_nftContract, _tokenId)
    {
        require(
            currentState == ExecutionState.WAITING_FOR_START,
            "not Waiting for start state"
        );

        paper = Paper(_nftContract, _tokenId);
    }

    /**
     * @notice reviewers send their reviews here.
     * @param _nftContract address to the Article ERC1155
     * @param _tokenId Id of the paper in the contract
     */
    function sendReview(address _nftContract, uint256 _tokenId)
        public
        onlySelectedReviewers
        onlyCreator(_nftContract, _tokenId)
    {
        require(
            currentState == ExecutionState.STARTED,
            "review process has not started yet"
        );
        require(hasSubmited[msg.sender] == false, "revieiwer already submited");
        Paper memory p = Paper(_nftContract, _tokenId);
        reviewPapers.push(p);
        hasSubmited[msg.sender] = true;
    }

    /**
     * @dev sets the selectedReviewers
     * @param _amount Maxmium value of random generated values
     */
    function getRandomAddresses(uint256 _amount) internal onlyOwner {
        require(
            isvalid == ValidateRandom.valid,
            "not elegible for random selection yet"
        );
        uint256 i = 0;
        while (selectedReviewers.length != _amount) {
            uint256 generated = (uint256(
                keccak256(abi.encode(randomValue, i))
            ) % possibleReviewers.length());
            address reviewer = possibleReviewers.at(generated);
            selectedReviewers.push(reviewer);
            possibleReviewers.remove(reviewer);
            i++;
        }
    }

    /**
     * @notice 2-5 reviewers are assgined randomly. The amount of reviewers is 
     * also a random number from 2 to 5.  
     * @dev There is a chance that the reviewer will act dishonestly and assing wallets that he owns
     * but nobody knows about and review himself. If there are many reviewers requesting for a review, 
     * the chances of this trick working diminishes. However, to make sure that only random scientists
     * are going to make reviews, a "proof of humanity" process should be done after the reviewing process
     * ended. After it's proven that reviewers were not biased towards the author, they should receive their
     * reward. 
     * NOTE: A proof of humanity process should be done, does not mean that in the current development of this
     * contract it will be done. It is a further improvement.
]    */
    function assignReviewers() public onlyOwner {
        require(
            possibleReviewers.length() >= 5,
            "cannot call review assignment, not enough reviewers joined"
        );

        currentState = ExecutionState.STARTED;
        uint256 amountOfReviewers = (randomValue % 4) + 2;
        getRandomAddresses(amountOfReviewers);

        individualReward = reward / selectedReviewers.length;
    }

    /**
     * @dev Auxiliary function to return the array of selected reviewrs.
]    */
    function getSelectedReviewers() public view returns (address[] memory) {
        return selectedReviewers;
    }

    /**
     * @notice functions that reviewers can call to receive payment for their review
     * @dev 
]    */
    function claimReward() public onlySelectedReviewers {
        require(!hasClaimed[msg.sender], "you already claimed");
        require(hasSubmited[msg.sender], "you must submit a review first");
        payable(msg.sender).transfer(individualReward);
        emit Transfer(address(this), msg.sender, individualReward);
    }

    /**
     * @notice researchers that wants his work reviewed MUST call this function.
     * before assinging reviewers. 
     * @dev this is a prototype contract. I'm giving any number here, just to 
     * be able to make tests locally
]    */
    function getRandomNumber() public returns (bytes32 requestId) {
        randomValue = 12309128309213098;
        // require(
        //     LINK.balanceOf(address(this)) >= sFee,
        //     "Not enough LINK - fill contract with faucet"
        // );
        // requestId = requestRandomness(sKeyhash, sFee);
        requestId = keccak256(abi.encodePacked("sample"));
        fulfillRandomness(requestId, randomValue);
    }

    /**
     * @notice reviewers register as which category they want to write reviews.
     * If the sender puts a category that does not exist in enum, it will simply not be selected.
     */
    function joinAsReviewer() public {
        require(
            currentState == ExecutionState.WAITING_FOR_START,
            "review process has already started"
        );
        require(msg.sender != owner(), "you cannot review yourself");
        possibleReviewers.add(msg.sender);
    }

    /**
     * @dev this function comes from VRFConsumerBase. It is necessary to get the random number.
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        randomValue = randomness;
        isvalid = ValidateRandom.valid;
    }
}
