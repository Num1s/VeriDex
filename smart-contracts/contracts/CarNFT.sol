// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./GaslessMetaTx.sol";

/**
 * @title CarNFT
 * @dev ERC-721 token for representing tokenized cars with VIN verification
 * Supports gasless transactions through EIP-2771
 */
contract CarNFT is ERC721, AccessControl, ReentrancyGuard, GaslessMetaTx {
    using Counters for Counters.Counter;

    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    Counters.Counter private _tokenIdCounter;

    // Car details structure (minimal)
    struct CarDetails {
        string vin;           // Vehicle Identification Number
        string make;          // Car manufacturer
        string model;         // Car model
        uint16 year;          // Manufacturing year
        bool verified;        // Verification status
    }

    // Token ID to car details mapping
    mapping(uint256 => CarDetails) public carDetails;

    // VIN to token ID mapping (for uniqueness check)
    mapping(string => uint256) public vinToTokenId;

    // Token URI mapping (replaces ERC721URIStorage)
    mapping(uint256 => string) private _tokenURIs;

    // Events
    event CarMinted(uint256 indexed tokenId, address indexed owner, string vin);
    event CarVerified(uint256 indexed tokenId, address indexed verifier);

    constructor(
        address trustedForwarder,
        address defaultAdmin,
        address verifier
    ) ERC721("AutoToken Car NFT", "CAR") GaslessMetaTx(trustedForwarder) {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(ADMIN_ROLE, defaultAdmin);
        _grantRole(VERIFIER_ROLE, verifier);
    }

    /**
     * @dev Mint a new car NFT
     * @param to Address to mint to
     * @param vin Vehicle Identification Number
     * @param make Car manufacturer
     * @param model Car model
     * @param year Manufacturing year
     * @param metadataURI IPFS metadata URI
     */
    function mintCar(
        address to,
        string calldata vin,
        string calldata make,
        string calldata model,
        uint16 year,
        string calldata metadataURI
    ) external nonReentrant returns (uint256) {
        require(vinToTokenId[vin] == 0, "CarNFT: VIN already exists");
        require(bytes(vin).length > 0, "CarNFT: VIN cannot be empty");
        require(bytes(make).length > 0, "CarNFT: Make cannot be empty");
        require(bytes(model).length > 0, "CarNFT: Model cannot be empty");
        require(year >= 1900 && year <= 2100, "CarNFT: Invalid year");
        require(to != address(0), "CarNFT: Cannot mint to zero address");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        // Store car details
        carDetails[tokenId] = CarDetails({
            vin: vin,
            make: make,
            model: model,
            year: year,
            verified: false
        });

        // Map VIN to token ID
        vinToTokenId[vin] = tokenId;

        // Mint NFT
        _mint(to, tokenId);
        _tokenURIs[tokenId] = metadataURI;

        emit CarMinted(tokenId, to, vin);

        return tokenId;
    }

    /**
     * @dev Verify a car (only verifier role)
     * @param tokenId Token ID to verify
     */
    function verifyCar(uint256 tokenId) external onlyRole(VERIFIER_ROLE) {
        require(_exists(tokenId), "CarNFT: Token does not exist");
        require(!carDetails[tokenId].verified, "CarNFT: Car already verified");

        carDetails[tokenId].verified = true;

        emit CarVerified(tokenId, _msgSender());
    }


    /**
     * @dev Get car details by token ID
     * @param tokenId Token ID
     */
    function getCarDetails(uint256 tokenId)
        external
        view
        returns (CarDetails memory)
    {
        require(_exists(tokenId), "CarNFT: Token does not exist");
        return carDetails[tokenId];
    }

    /**
     * @dev Get token ID by VIN
     * @param vin Vehicle Identification Number
     */
    function getTokenIdByVIN(string calldata vin) external view returns (uint256) {
        return vinToTokenId[vin];
    }

    /**
     * @dev Check if VIN exists
     * @param vin Vehicle Identification Number
     */
    function vinExists(string calldata vin) external view returns (bool) {
        return vinToTokenId[vin] != 0;
    }

    /**
     * @dev Get total supply of cars
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev Override supportsInterface for AccessControl
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Burn a car NFT (only owner or approved)
     * @param tokenId Token ID to burn
     */
    function burn(uint256 tokenId) external {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "CarNFT: Not owner or approved");
        _burn(tokenId);
    }

    /**
     * @dev Override _burn to clear car details
     */
    function _burn(uint256 tokenId) internal override(ERC721) {
        // Clear token URI
        delete _tokenURIs[tokenId];

        // Clear VIN mapping
        string memory vin = carDetails[tokenId].vin;
        if (bytes(vin).length > 0) {
            delete vinToTokenId[vin];
        }

        // Clear car details
        delete carDetails[tokenId];

        super._burn(tokenId);
    }

    /**
     * @dev Override tokenURI to return stored URI
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721)
        returns (string memory)
    {
        require(_exists(tokenId), "CarNFT: URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }

    /**
     * @dev Override _msgSender for gasless transactions
     */
    function _msgSender()
        internal
        view
        override(Context, GaslessMetaTx)
        returns (address)
    {
        return GaslessMetaTx._msgSender();
    }

    /**
     * @dev Override _msgData for gasless transactions
     */
    function _msgData()
        internal
        view
        override(Context, GaslessMetaTx)
        returns (bytes calldata)
    {
        return GaslessMetaTx._msgData();
    }

    /**
     * @dev Override _contextSuffixLength for ERC2771Context
     */
    function _contextSuffixLength()
        internal
        view
        override(Context, GaslessMetaTx)
        returns (uint256)
    {
        return GaslessMetaTx._contextSuffixLength();
    }
}
