// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * @title A contract that handles who will be reviewing a paper
 * @author Pedro Henrique Bufulin de Almeida
 * @notice  A paper author deploys this contract.
 * It uses chainlink VRF to handle randomization of selected reviewers.
 * Reviewers call the joinAsReviewer function to have a chance to be elegible for a right to review.
 * @custom:experimental This is an experimental contract.
 */
contract ReviewHandler is VRFConsumerBase, Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.UintSet;
    bytes32 private sKeyhash;
    uint256 private sFee;
    uint256 public randomValue;
    address[] public possibleReviewers;
    address[] public selectedReviewers;
    EnumerableSet.UintSet private randomIndexes;

    ValidateRandom public isvalid;

    enum ValidateRandom {
        valid,
        invalid
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
    }

    /**
     * @dev returns a Set of random unique values between 0 and _amount.
     * @param _amount Maxmium value of random generated values
     */
    function genMulti(uint256 _amount) public onlyOwner {
        require(
            isvalid == ValidateRandom.valid,
            "not elegible for random selection yet"
        );

        uint256 i = 0;
        while (randomIndexes.length() != _amount) {
            uint256 generated = (uint256(
                keccak256(abi.encode(randomValue, i))
            ) % _amount);
            if (!randomIndexes.contains(generated)) {
                randomIndexes.add(generated);
            }
        }
    }

    /**
     * @notice 2-5 reviewers are assgined randomly. The amount of reviewers is 
     * also a random number from 2 to 5.  
]    */
    function assignReviewrs() public onlyOwner {
        require(
            possibleReviewers.length >= 5,
            "cannot call review assignment, not enough reviewers joined"
        );

        uint256 amountOfReviewers = (randomValue % 4) + 2;
        genMulti(amountOfReviewers);
        for (uint256 i = 0; i < randomIndexes.length(); i++) {
            address selected = possibleReviewers[randomIndexes.at(i)];
            selectedReviewers.push(selected);
        }
    }

    function getRandomNumber() public returns (bytes32 requestId) {
        require(
            LINK.balanceOf(address(this)) >= sFee,
            "Not enough LINK - fill contract with faucet"
        );
        requestId = requestRandomness(sKeyhash, sFee);
    }

    /**
     * @notice reviewers register as which category they want to write reviews.
     * If the sender puts a category that does not exist in enum, it will simply not be selected.
     */
    function joinAsReviewer() public {
        possibleReviewers.push(msg.sender);
    }

    function setRandomReviewers() public onlyOwner {}

    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        randomValue = randomness;
        isvalid = ValidateRandom.valid;
    }
}
