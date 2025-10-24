// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./GaslessMetaTx.sol";

/**
 * @title Roles
 * @dev Access control roles for the AutoToken platform
 * Supports gasless transactions through meta-tx
 */
contract Roles is AccessControl, GaslessMetaTx {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");

    // Role descriptions
    mapping(bytes32 => string) public roleDescriptions;

    // Events (inherited from AccessControl)
    // event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    // event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);

    constructor(
        address trustedForwarder,
        address defaultAdmin,
        address verifier,
        address treasury
    ) GaslessMetaTx(trustedForwarder) {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(ADMIN_ROLE, defaultAdmin);

        if (verifier != address(0)) {
            _grantRole(VERIFIER_ROLE, verifier);
        }

        if (treasury != address(0)) {
            _grantRole(TREASURY_ROLE, treasury);
        }

        // Set role descriptions
        roleDescriptions[DEFAULT_ADMIN_ROLE] = "Default Admin Role";
        roleDescriptions[ADMIN_ROLE] = "Platform Administrator";
        roleDescriptions[VERIFIER_ROLE] = "Car Verification Authority";
        roleDescriptions[TREASURY_ROLE] = "Treasury Manager";
    }

    /**
     * @dev Grant role to account (only admin)
     * @param role Role to grant
     * @param account Account to grant role to
     */
    function grantRole(bytes32 role, address account)
        public
        override
        onlyRole(getRoleAdmin(role))
    {
        _grantRole(role, account);
        emit RoleGranted(role, account, _msgSender());
    }

    /**
     * @dev Revoke role from account (only admin)
     * @param role Role to revoke
     * @param account Account to revoke role from
     */
    function revokeRole(bytes32 role, address account)
        public
        override
        onlyRole(getRoleAdmin(role))
    {
        _revokeRole(role, account);
        emit RoleRevoked(role, account, _msgSender());
    }

    /**
     * @dev Add new role (only default admin)
     * @param role Role identifier
     * @param adminRole Admin role for the new role
     * @param description Role description
     */
    function addRole(
        bytes32 role,
        bytes32 adminRole,
        string calldata description
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(adminRole != bytes32(0), "Roles: Admin role cannot be zero");
        require(bytes(description).length > 0, "Roles: Description cannot be empty");

        _setRoleAdmin(role, adminRole);
        roleDescriptions[role] = description;
    }

    /**
     * @dev Check if account has role
     * @param role Role identifier
     * @param account Account to check
     */
    function hasRole(bytes32 role, address account)
        public
        view
        override
        returns (bool)
    {
        return super.hasRole(role, account);
    }

    /**
     * @dev Get role description
     * @param role Role identifier
     */
    function getRoleDescription(bytes32 role) external view returns (string memory) {
        return roleDescriptions[role];
    }

    /**
     * @dev Get all roles for an account
     * @param account Account to check
     */
    function getRoles(address account) external view returns (bytes32[] memory) {
        // Simplified version - return empty array to reduce complexity
        return new bytes32[](0);
    }

    /**
     * @dev Override supportsInterface for AccessControl
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
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
