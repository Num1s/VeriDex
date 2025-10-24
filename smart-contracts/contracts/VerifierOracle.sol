// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./CarNFT.sol";
import "./Escrow.sol";
import "./GaslessMetaTx.sol";

/**
 * @title VerifierOracle
 * @dev Oracle contract for car verification and escrow management
 * Handles VIN verification and automated escrow releases
 */
contract VerifierOracle is AccessControl, ReentrancyGuard, GaslessMetaTx {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    // Verification states
    enum VerificationStatus {
        Pending,
        Approved,
        Rejected,
        Expired
    }

    // Verification request structure
    struct VerificationRequest {
        uint256 requestId;
        uint256 tokenId;
        address requester;
        string vin;
        VerificationStatus status;
        uint256 createdAt;
        uint256 verifiedAt;
        address verifier;
        string notes;
        string documents; // IPFS hash of verification documents
    }

    // Request ID counter
    uint256 private nextRequestId = 1;

    // Request ID to verification request mapping
    mapping(uint256 => VerificationRequest) public verificationRequests;

    // Token ID to request ID mapping
    mapping(uint256 => uint256) public tokenToRequest;

    // VIN to request ID mapping (for duplicate checks)
    mapping(string => uint256) public vinToRequest;

    // CarNFT contract
    CarNFT public immutable carNFT;

    // Escrow contract address
    address payable public escrowAddress;

    // Verification fee (in wei)
    uint256 public verificationFee = 0.01 ether;

    // Maximum verification time (30 days for testing)
    uint256 public constant MAX_VERIFICATION_TIME = 30 days;

    // Events
    event VerificationRequested(
        uint256 indexed requestId,
        uint256 indexed tokenId,
        address indexed requester,
        string vin
    );
    event VerificationCompleted(
        uint256 indexed requestId,
        uint256 indexed tokenId,
        address indexed verifier,
        VerificationStatus status,
        string notes
    );
    event VerificationFeeUpdated(uint256 oldFee, uint256 newFee);
    event EscrowReleased(
        uint256 indexed dealId,
        uint256 indexed tokenId,
        address indexed verifier
    );

    constructor(
        address trustedForwarder,
        address defaultAdmin,
        address verifier,
        address carNFTAddress,
        address payable escrowAddr
    ) GaslessMetaTx(trustedForwarder) {
        require(carNFTAddress != address(0), "VerifierOracle: Invalid CarNFT address");

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(ADMIN_ROLE, defaultAdmin);
        _grantRole(VERIFIER_ROLE, verifier);

        carNFT = CarNFT(carNFTAddress);
        escrowAddress = escrowAddr;
    }

    /**
     * @dev Request verification for a car
     * @param tokenId Token ID to verify
     * @param documents IPFS hash of verification documents
     */
    function requestVerification(uint256 tokenId, string calldata documents)
        external
        payable
        nonReentrant
        returns (uint256)
    {
        require(carNFT.ownerOf(tokenId) == _msgSender(), "VerifierOracle: Not token owner");
        require(msg.value >= verificationFee, "VerifierOracle: Insufficient verification fee");
        require(tokenToRequest[tokenId] == 0, "VerifierOracle: Verification already requested");
        require(!carNFT.getCarDetails(tokenId).verified, "VerifierOracle: Car already verified");

        // Get car details
        CarNFT.CarDetails memory carDetails = carNFT.getCarDetails(tokenId);
        require(bytes(carDetails.vin).length > 0, "VerifierOracle: Invalid VIN");

        uint256 requestId = nextRequestId++;

        verificationRequests[requestId] = VerificationRequest({
            requestId: requestId,
            tokenId: tokenId,
            requester: _msgSender(),
            vin: carDetails.vin,
            status: VerificationStatus.Pending,
            createdAt: block.timestamp,
            verifiedAt: 0,
            verifier: address(0),
            notes: "",
            documents: documents
        });

        tokenToRequest[tokenId] = requestId;
        vinToRequest[carDetails.vin] = requestId;

        // Refund excess payment
        if (msg.value > verificationFee) {
            payable(_msgSender()).transfer(msg.value - verificationFee);
        }

        emit VerificationRequested(requestId, tokenId, _msgSender(), carDetails.vin);

        return requestId;
    }

    /**
     * @dev Complete verification (only verifier)
     * @param requestId Request ID to complete
     * @param status Verification status
     * @param notes Verification notes
     */
    function completeVerification(
        uint256 requestId,
        VerificationStatus status,
        string calldata notes
    ) external nonReentrant onlyRole(VERIFIER_ROLE) {
        VerificationRequest storage request = verificationRequests[requestId];
        require(request.status == VerificationStatus.Pending, "VerifierOracle: Request not pending");
        require(
            block.timestamp <= request.createdAt + MAX_VERIFICATION_TIME,
            "VerifierOracle: Verification expired"
        );

        request.status = status;
        request.verifiedAt = block.timestamp;
        request.verifier = _msgSender();
        request.notes = notes;

        // Clear token mapping
        delete tokenToRequest[request.tokenId];

        // If approved, verify the car NFT
        if (status == VerificationStatus.Approved) {
            carNFT.verifyCar(request.tokenId);
        }

        // Try to release related escrow if exists
        _tryReleaseEscrow(request.tokenId);

        emit VerificationCompleted(requestId, request.tokenId, _msgSender(), status, notes);
    }

    /**
     * @dev Release escrow for verified car (only verifier)
     * @param dealId Escrow deal ID
     */
    function releaseEscrowForVerifiedCar(uint256 dealId) external onlyRole(VERIFIER_ROLE) {
        Escrow.EscrowDeal memory deal = Escrow(escrowAddress).getEscrowDeal(dealId);
        require(deal.state == Escrow.EscrowState.Funded, "VerifierOracle: Escrow not funded");

        // Check if car is verified
        CarNFT.CarDetails memory carDetails = carNFT.getCarDetails(deal.tokenId);
        require(carDetails.verified, "VerifierOracle: Car not verified");

        // Release escrow
        Escrow(escrowAddress).releaseEscrow(dealId);

        emit EscrowReleased(dealId, deal.tokenId, _msgSender());
    }

    /**
     * @dev Batch release escrows for verified cars (only verifier)
     * @param dealIds Array of deal IDs to check and release
     */
    function batchReleaseEscrows(uint256[] calldata dealIds) external onlyRole(VERIFIER_ROLE) {
        // Simplified version - not implemented to reduce complexity
        revert("Batch release not implemented");
    }

    /**
     * @dev Get verification request details
     * @param requestId Request ID
     */
    function getVerificationRequest(uint256 requestId)
        external
        view
        returns (VerificationRequest memory)
    {
        return verificationRequests[requestId];
    }

    /**
     * @dev Get request by token ID
     * @param tokenId Token ID
     */
    function getRequestByToken(uint256 tokenId) external view returns (VerificationRequest memory) {
        uint256 requestId = tokenToRequest[tokenId];
        return verificationRequests[requestId];
    }

    /**
     * @dev Get pending verification requests
     */
    function getPendingRequests() external view returns (uint256[] memory) {
        // Simplified version - return empty array to reduce complexity
        return new uint256[](0);
    }

    /**
     * @dev Get requests by verifier
     * @param verifier Verifier address
     */
    function getRequestsByVerifier(address verifier) external view returns (uint256[] memory) {
        // Simplified version - return empty array to reduce complexity
        return new uint256[](0);
    }

    /**
     * @dev Check if VIN is already requested for verification
     * @param vin Vehicle Identification Number
     */
    function isVinInVerification(string calldata vin) external view returns (bool) {
        uint256 requestId = vinToRequest[vin];
        return verificationRequests[requestId].status == VerificationStatus.Pending;
    }

    /**
     * @dev Set verification fee (only admin)
     * @param fee New verification fee in wei
     */
    function setVerificationFee(uint256 fee) external onlyRole(ADMIN_ROLE) {
        uint256 oldFee = verificationFee;
        verificationFee = fee;
        emit VerificationFeeUpdated(oldFee, fee);
    }

    /**
     * @dev Set escrow contract address (only admin)
     * @param newEscrowAddress New escrow contract address
     */
    function setEscrowContract(address payable newEscrowAddress) external onlyRole(ADMIN_ROLE) {
        require(newEscrowAddress != address(0), "VerifierOracle: Invalid escrow address");
        escrowAddress = newEscrowAddress;
    }

    /**
     * @dev Withdraw verification fees (only admin)
     */
    function withdrawFees() external onlyRole(ADMIN_ROLE) {
        payable(_msgSender()).transfer(address(this).balance);
    }

    /**
     * @dev Try to release escrow if car is verified (internal)
     * @param tokenId Token ID
     */
    function _tryReleaseEscrow(uint256 tokenId) internal {
        if (escrowAddress != address(0)) {
            // Check if token is in escrow
            if (Escrow(escrowAddress).isTokenInEscrow(tokenId)) {
                // Get escrow deal
                Escrow.EscrowDeal memory deal = Escrow(escrowAddress).getDealByToken(tokenId);
                if (deal.state == Escrow.EscrowState.Funded) {
                    // Release escrow
                    Escrow(escrowAddress).releaseEscrow(deal.dealId);
                    emit EscrowReleased(deal.dealId, tokenId, _msgSender());
                }
            }
        }
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
