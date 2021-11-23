// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title A contract that handles who will be reviewing a paper
 * @author Pedro Henrique Bufulin de Almeida
 * @notice reviewers register as which category they want to write reviews for. A reviewer
 * deploys this contract. It uses chainlink VRF to handle randomization of selected reviewers.
 * Reviewers call the joinAsReviewer function to have a chance to be elegible for a right to review.
 * @custom:experimental This is an experimental contract.
 */
contract ReviewHandler is VRFConsumerBase, Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;
    bytes32 private sKeyhash;
    uint256 private sFee;
    uint256 public randomValue;
    address[] public reviewers;
    


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

    }

    /**
     * @dev returns an array of n random values between 0 and j.
     * @param _randomValue The value received from VRF
     * @param n How many random values to generate
     */
    function genMulti(uint256 _randomValue, uint256 n, uint256 j)
        public
        pure
        returns (uint256[] memory multiRandom)
    {
        multiRandom = new uint256[](n);
        for (uint256 i = 0; i < n; i++) {
            multiRandom[i] = (uint256(keccak256(abi.encode(_randomValue, i))) % j);
        }
        return multiRandom;
    }

    function getRandomNumber() public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= sFee, "Not enough LINK - fill contract with faucet");
        requestId = requestRandomness(sKeyhash, sFee);
        
    }

    /**
     * @notice reviewers register as which category they want to write reviews.
     * If the sender puts a category that does not exist in enum, it will simply not be selected.
     */
    function joinAsReviewer() public {
        reviewers.push(msg.sender);
    }

    function setRandomReviewers() public onlyOwner {

    }


    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        randomValue = randomness;
    }
}
