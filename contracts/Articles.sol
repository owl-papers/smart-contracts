// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Articles is ERC1155Supply {
    using Counters for Counters.Counter;
    Counters.Counter private lastId;
    mapping(uint256 => string) private _uris;
    mapping(uint256 => address) public creators;


    event ArticleMinted(
        address indexed creator,
        string  uri,
        uint256 indexed id,
        uint256 initialSupply
    );


    constructor() ERC1155("Articles") {}

    function uri(uint256 tokenId) public view override returns (string memory) {
        return (_uris[tokenId]);
    }

    /**
     * @dev Require msg.sender to be the creator of the token id
     */
    modifier creatorOnly(uint256 _id) {
        require(creators[_id] == msg.sender, "restricted to creator");
        _;
    }

    /**
     * @dev Creates a new token type and assigns _initialSupply msg.sender address
     * @param _initialSupply amount to supply the first owner
     * @param _uri URI for this token
     */
    function create(uint256 _initialSupply, string memory _uri) public {
        _uris[lastId.current()] = _uri;
        creators[lastId.current()] = msg.sender;
        _mint(msg.sender, lastId.current(), _initialSupply, "");
        emit ArticleMinted(msg.sender, _uri, lastId.current(), _initialSupply);
        lastId.increment();
    }

    /**
     * @dev Creates a new token type and assigns _initialSupply to an addresss
     * @param _aditionalSupply amount to supply the first owner
     * @param _id to apply additional supplys
     */
    function increaseSupply(uint256 _aditionalSupply, uint256 _id)
        public
        creatorOnly(_id)
    {
        _mint(msg.sender, _id, _aditionalSupply, "");
    }

    /**
     * @dev returns the latest Id
     */
    function getLatestId() public view returns (uint256) {
        return lastId.current();
    }
}
