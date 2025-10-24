// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/metatx/MinimalForwarder.sol";

/**
 * @title GaslessMetaTx
 * @dev Wrapper for ERC2771Context with trusted forwarder support
 * Enables gasless transactions through meta-transaction relayers
 */
contract GaslessMetaTx is ERC2771Context {
    // Trusted forwarder address (public copy for external access)
    address public trustedForwarderAddress;

    // Events
    event TrustedForwarderUpdated(address indexed oldForwarder, address indexed newForwarder);

    constructor(address trustedForwarder) ERC2771Context(trustedForwarder) {
        trustedForwarderAddress = trustedForwarder;
    }

    /**
     * @dev Get current trusted forwarder
     */
    function getTrustedForwarder() external view returns (address) {
        return trustedForwarderAddress;
    }

    /**
     * @dev Override to check if caller is trusted forwarder
     */
    function _msgSender() internal view virtual override returns (address) {
        return ERC2771Context._msgSender();
    }

    /**
     * @dev Override to get original message data
     */
    function _msgData() internal view virtual override returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    /**
     * @dev Override _contextSuffixLength
     */
    function _contextSuffixLength() internal view virtual override returns (uint256) {
        return ERC2771Context._contextSuffixLength();
    }

    /**
     * @dev Check if address is trusted forwarder
     */
    function isTrustedForwarder(address forwarder) public view override returns (bool) {
        return forwarder == trustedForwarderAddress;
    }
}
