import { ethers } from 'ethers';
import config from '../config/index.js';

class Web3Service {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(config.blockchain.rpcUrl);
    this.signer = config.blockchain.privateKey
      ? new ethers.Wallet(config.blockchain.privateKey, this.provider)
      : null;
  }

  /**
   * Get contract instance
   * @param {string} contractAddress - Contract address
   * @param {Array} abi - Contract ABI
   * @param {boolean} withSigner - Whether to use signer (default: false)
   * @returns {ethers.Contract} - Contract instance
   */
  getContract(contractAddress, abi, withSigner = false) {
    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('Invalid contract address');
    }

    const contract = new ethers.Contract(
      contractAddress,
      abi,
      withSigner && this.signer ? this.signer : this.provider
    );

    return contract;
  }

  /**
   * Validate Ethereum address
   * @param {string} address - Address to validate
   * @returns {boolean} - True if valid
   */
  isValidAddress(address) {
    try {
      return ethers.utils.isAddress(address);
    } catch {
      return false;
    }
  }

  /**
   * Format address for display
   * @param {string} address - Address to format
   * @returns {string} - Formatted address
   */
  formatAddress(address) {
    if (!this.isValidAddress(address)) {
      return address;
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Generate nonce for authentication
   * @returns {string} - Random nonce
   */
  generateNonce() {
    return Math.floor(Math.random() * 1000000).toString();
  }

  /**
   * Verify message signature
   * @param {string} message - Original message
   * @param {string} signature - Signature
   * @param {string} expectedAddress - Expected signer address
   * @returns {boolean} - True if signature is valid
   */
  verifySignature(message, signature, expectedAddress) {
    try {
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
      console.error('Signature verification error:', error.message);
      return false;
    }
  }

  /**
   * Encode function call data
   * @param {string} contractInterface - Contract interface (ABI)
   * @param {string} functionName - Function name
   * @param {Array} params - Function parameters
   * @returns {string} - Encoded function call data
   */
  encodeFunctionCall(contractInterface, functionName, params = []) {
    try {
      const iface = new ethers.utils.Interface(contractInterface);
      return iface.encodeFunctionData(functionName, params);
    } catch (error) {
      console.error('Function encoding error:', error.message);
      throw error;
    }
  }

  /**
   * Decode function call data
   * @param {string} contractInterface - Contract interface (ABI)
   * @param {string} data - Encoded function call data
   * @returns {Object} - Decoded function call
   */
  decodeFunctionCall(contractInterface, data) {
    try {
      const iface = new ethers.utils.Interface(contractInterface);
      return iface.decodeFunctionData(iface.getFunction(data.slice(0, 10)), data);
    } catch (error) {
      console.error('Function decoding error:', error.message);
      throw error;
    }
  }

  /**
   * Get current block number
   * @returns {Promise<number>} - Current block number
   */
  async getBlockNumber() {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      console.error('Block number fetch error:', error.message);
      throw error;
    }
  }

  /**
   * Get transaction receipt
   * @param {string} txHash - Transaction hash
   * @returns {Promise<Object>} - Transaction receipt
   */
  async getTransactionReceipt(txHash) {
    try {
      return await this.provider.getTransactionReceipt(txHash);
    } catch (error) {
      console.error('Transaction receipt fetch error:', error.message);
      throw error;
    }
  }

  /**
   * Get current gas price
   * @returns {Promise<string>} - Gas price in wei
   */
  async getGasPrice() {
    try {
      const gasPrice = await this.provider.getGasPrice();
      return gasPrice.toString();
    } catch (error) {
      console.error('Gas price fetch error:', error.message);
      return config.blockchain.gasPrice.toString();
    }
  }

  /**
   * Check if address has code (is a contract)
   * @param {string} address - Address to check
   * @returns {Promise<boolean>} - True if contract
   */
  async isContract(address) {
    try {
      const code = await this.provider.getCode(address);
      return code !== '0x';
    } catch (error) {
      console.error('Contract check error:', error.message);
      return false;
    }
  }

  /**
   * Get ETH balance of address
   * @param {string} address - Address to check
   * @returns {Promise<string>} - Balance in ETH
   */
  async getBalance(address) {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Balance fetch error:', error.message);
      return '0';
    }
  }

  /**
   * Format wei to ETH
   * @param {string|number} wei - Amount in wei
   * @returns {string} - Amount in ETH
   */
  formatEther(wei) {
    return ethers.utils.formatEther(wei);
  }

  /**
   * Parse ETH to wei
   * @param {string|number} eth - Amount in ETH
   * @returns {string} - Amount in wei
   */
  parseEther(eth) {
    return ethers.utils.parseEther(eth.toString());
  }
}

const web3Service = new Web3Service();

export default web3Service;
