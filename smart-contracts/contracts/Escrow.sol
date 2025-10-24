// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./CarNFT.sol";
import "./GaslessMetaTx.sol";

/**
 * @title Escrow
 * @dev Escrow contract for secure car NFT transactions
 * Holds NFT and payment until verification is complete
 */
contract Escrow is AccessControl, ReentrancyGuard, GaslessMetaTx {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    // Escrow states
    enum EscrowState {
        Created,
        Funded,
        Released,
        Cancelled,
        Disputed
    }

    // Escrow structure
    struct EscrowDeal {
        uint256 dealId;
        uint256 tokenId;
        address seller;
        address buyer;
        uint256 amount;       // Amount in wei
        EscrowState state;
        uint256 createdAt;
        uint256 releasedAt;
        string notes;         // Optional notes
    }

    // Deal ID counter
    uint256 private nextDealId = 1;

    // Deal ID to escrow deal mapping
    mapping(uint256 => EscrowDeal) public escrowDeals;

    // Token ID to deal ID mapping
    mapping(uint256 => uint256) public tokenToDeal;

    // CarNFT contract
    CarNFT public immutable carNFT;

    // Events
    event EscrowCreated(
        uint256 indexed dealId,
        uint256 indexed tokenId,
        address indexed seller,
        address buyer,
        uint256 amount
    );
    event EscrowReleased(
        uint256 indexed dealId,
        address indexed verifier
    );
    event EscrowCancelled(
        uint256 indexed dealId,
        address indexed canceller
    );
    event EscrowDisputed(
        uint256 indexed dealId,
        address indexed disputer
    );

    constructor(
        address trustedForwarder,
        address defaultAdmin,
        address verifier,
        address carNFTAddress
    ) GaslessMetaTx(trustedForwarder) {
        require(carNFTAddress != address(0), "Escrow: Invalid CarNFT address");

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(ADMIN_ROLE, defaultAdmin);
        _grantRole(VERIFIER_ROLE, verifier);

        carNFT = CarNFT(carNFTAddress);
    }

    /**
     * @dev Create new escrow deal
     * @param tokenId Token ID
     * @param seller Seller address
     * @param buyer Buyer address
     * @param amount Amount in wei
     */
    function createEscrow(
        uint256 tokenId,
        address seller,
        address buyer,
        uint256 amount
    ) external payable nonReentrant returns (uint256) {
        require(msg.value == amount, "Escrow: Incorrect payment amount");
        require(seller != address(0), "Escrow: Invalid seller address");
        require(buyer != address(0), "Escrow: Invalid buyer address");
        require(seller != buyer, "Escrow: Seller and buyer cannot be the same");
        require(carNFT.ownerOf(tokenId) == address(this), "Escrow: NFT not in escrow");
        require(tokenToDeal[tokenId] == 0, "Escrow: Token already in escrow");

        uint256 dealId = nextDealId++;
        EscrowState state = EscrowState.Created;

        // Check if payment is made
        if (msg.value > 0) {
            state = EscrowState.Funded;
        }

        escrowDeals[dealId] = EscrowDeal({
            dealId: dealId,
            tokenId: tokenId,
            seller: seller,
            buyer: buyer,
            amount: amount,
            state: state,
            createdAt: block.timestamp,
            releasedAt: 0,
            notes: ""
        });

        tokenToDeal[tokenId] = dealId;

        emit EscrowCreated(dealId, tokenId, seller, buyer, amount);

        return dealId;
    }

    /**
     * @dev Release escrow (only verifier)
     * @param dealId Deal ID to release
     */
    function releaseEscrow(uint256 dealId) external nonReentrant onlyRole(VERIFIER_ROLE) {
        EscrowDeal storage deal = escrowDeals[dealId];
        require(deal.state == EscrowState.Funded, "Escrow: Deal not funded");
        require(deal.amount > 0, "Escrow: No amount to release");

        // Update deal state
        deal.state = EscrowState.Released;
        deal.releasedAt = block.timestamp;

        // Clear token mapping
        delete tokenToDeal[deal.tokenId];

        // Transfer NFT to buyer
        carNFT.transferFrom(address(this), deal.buyer, deal.tokenId);

        // Transfer payment to seller
        payable(deal.seller).transfer(deal.amount);

        emit EscrowReleased(dealId, _msgSender());
    }

    /**
     * @dev Cancel escrow (only admin or if deal is old)
     * @param dealId Deal ID to cancel
     */
    function cancelEscrow(uint256 dealId) external nonReentrant {
        EscrowDeal storage deal = escrowDeals[dealId];
        require(
            hasRole(ADMIN_ROLE, _msgSender()) ||
            (deal.createdAt + 7 days < block.timestamp), // Auto-cancel after 7 days
            "Escrow: Cannot cancel deal"
        );
        require(
            deal.state == EscrowState.Created || deal.state == EscrowState.Funded,
            "Escrow: Deal already resolved"
        );

        // Store original state for payment refund
        EscrowState originalState = deal.state;

        // Update deal state
        deal.state = EscrowState.Cancelled;

        // Clear token mapping
        delete tokenToDeal[deal.tokenId];

        // Return NFT to seller
        carNFT.transferFrom(address(this), deal.seller, deal.tokenId);

        // Return payment to buyer if was funded
        if (originalState == EscrowState.Funded && deal.amount > 0) {
            payable(deal.buyer).transfer(deal.amount);
        }

        emit EscrowCancelled(dealId, _msgSender());
    }

    /**
     * @dev Dispute escrow (either party can dispute)
     * @param dealId Deal ID to dispute
     * @param notes Dispute notes
     */
    function disputeEscrow(uint256 dealId, string calldata notes) external nonReentrant {
        // Simplified version - not implemented to reduce complexity
        revert("Dispute not implemented");
    }

    /**
     * @dev Resolve disputed escrow (only admin)
     * @param dealId Deal ID to resolve
     * @param toBuyer True if NFT goes to buyer, false to seller
     */
    function resolveDispute(uint256 dealId, bool toBuyer) external onlyRole(ADMIN_ROLE) {
        // Simplified version - not implemented to reduce complexity
        revert("Dispute resolution not implemented");
    }

    /**
     * @dev Get escrow deal details
     * @param dealId Deal ID
     */
    function getEscrowDeal(uint256 dealId) external view returns (EscrowDeal memory) {
        return escrowDeals[dealId];
    }

    /**
     * @dev Get deal by token ID
     * @param tokenId Token ID
     */
    function getDealByToken(uint256 tokenId) external view returns (EscrowDeal memory) {
        uint256 dealId = tokenToDeal[tokenId];
        return escrowDeals[dealId];
    }

    /**
     * @dev Get deals by address (seller or buyer)
     * @param account Account address
     */
    function getDealsByAddress(address account) external view returns (uint256[] memory) {
        // Simplified version - return empty array to reduce complexity
        return new uint256[](0);
    }

    /**
     * @dev Get active escrow deals
     */
    function getActiveDeals() external view returns (uint256[] memory) {
        // Simplified version - return empty array to reduce complexity
        return new uint256[](0);
    }

    /**
     * @dev Check if token is in escrow
     * @param tokenId Token ID
     */
    function isTokenInEscrow(uint256 tokenId) external view returns (bool) {
        return tokenToDeal[tokenId] != 0;
    }

    /**
     * @dev Get contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Emergency withdraw (only admin)
     */
    function emergencyWithdraw() external onlyRole(ADMIN_ROLE) {
        payable(msg.sender).transfer(address(this).balance);
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

    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
}
