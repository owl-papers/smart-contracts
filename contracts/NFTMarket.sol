pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

contract NFTMarket is ReentrancyGuard, ERC1155Holder {
    using Counters for Counters.Counter;
    Counters.Counter private latestItemId;
    mapping(uint256 => MarketItem) private marketItems;

    struct MarketItem {
        uint256 tokenId;
        uint256 price;
        uint256 amount;
        address nftContract;
        address payable seller;
        bool soldOut;
        bool exists;
    }

    event SellOrderCreated(
        uint256 indexed itemId,
        uint256 indexed tokenId,
        uint256 price,
        uint256 amount,
        address indexed nftContract,
        address seller
    );

    event SouldOut (
        uint256 indexed itemId
    );


    constructor() {}

    /**
     * @dev Makes a sell order that some buyer can fulfill
     * @param _nftContract Contract of the NFT. This NFTMarket contract does not restrict to the ERC1155 articles contract
     * but it only works for IERC1155 compilant contracts
     * @param _tokenId id of the selling item of the ERC1155
     * @param _price price for each one of the tokens being listed
     * @param _amount amount of tokens being listed
     */
    function sell(
        address _nftContract,
        uint256 _tokenId,
        uint256 _price,
        uint256 _amount
    ) public nonReentrant {
        require(_price > 0, "prince cannot be 0");

        IERC1155(_nftContract).safeTransferFrom(
            msg.sender,
            address(this),
            _tokenId,
            _amount,
            ""
        );

        marketItems[latestItemId.current()] = MarketItem(
            _tokenId,
            _price,
            _amount,
            _nftContract,
            payable(msg.sender),
            false,
            true
        );

        emit SellOrderCreated(
            latestItemId.current(),
            _tokenId,
            _price,
            _amount,
            _nftContract,
            payable(msg.sender)
        );
    }

    /**
     * @dev Makes a buy order to fulfill some sell order
     * @param _itemId id of the selling item in this contract
     * @param _amount amount of tokens being listed
     */
    function buy(uint256 _itemId, uint256 _amount) public payable nonReentrant {
        require(marketItems[_itemId].exists, "item does not exist");
        require(!marketItems[_itemId].soldOut, "item is sold out");
        require(
            msg.value == marketItems[_itemId].price,
            "value sent does not match requested price"
        );
        require(
            _amount <= marketItems[_itemId].amount,
            "buying amount needs to be less or equal"
        );

        marketItems[_itemId].seller.transfer(msg.value);
        IERC1155(marketItems[_itemId].nftContract).safeTransferFrom(
            address(this),
            msg.sender,
            marketItems[_itemId].tokenId,
            _amount,
            ""
        );

        marketItems[_itemId].amount -= _amount;
        if (marketItems[_itemId].amount == 0) {
            marketItems[_itemId].soldOut = true;
            emit SouldOut(_itemId);
        }
    }

    function getLatestItemId() public view returns (uint256) {
        return latestItemId.current();
    }
}
