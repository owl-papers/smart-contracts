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
contract PrototypeReviewHandler is  Ownable {
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

    constructor(
    )  {
        randomValue = 49123412385124901238412093;
        isvalid = ValidateRandom.invalid;
    }

    /**
     * @dev returns a Set of random unique values between 0 and _amount.
     * @param _amount Maxmium value of random generated values
     */
    function genMulti(uint256 _amount) internal onlyOwner {
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
            i += 1;
            if (i > _amount * 20) {
                break;
            }
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
     * contract it will be done. s 
]    */
    function assignReviewers() public onlyOwner {
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

    function getSelectedReviewers() public view returns (address[] memory) {
        return selectedReviewers;
    }
    
    function fullfill() public {
        isvalid = ValidateRandom.valid;
    }

    /**
     * @notice reviewers register as which category they want to write reviews.
     * If the sender puts a category that does not exist in enum, it will simply not be selected.
     */
    function joinAsReviewer() public {
        require(msg.sender != owner(), "you cannot review yourself");
        possibleReviewers.push(msg.sender);
    }


}
