import { ethers } from 'ethers';
import config from './index.js';

class RelayerService {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(config.blockchain.rpcUrl);
    this.signer = new ethers.Wallet(config.blockchain.privateKey, this.provider);
    this.trustedForwarder = config.gasless.trustedForwarder;
  }

  /**
   * Send meta-transaction through trusted forwarder
   * @param {string} to - Target contract address
   * @param {string} data - Encoded function call data
   * @param {string} signature - User's signature
   * @param {string} userAddress - User's wallet address
   * @returns {Promise<string>} - Transaction hash
   */
  async sendMetaTransaction(to, data, signature, userAddress) {
    try {
      if (!this.trustedForwarder) {
        throw new Error('Trusted forwarder not configured');
      }

      // For now, we'll use a simple implementation
      // In production, this would integrate with Biconomy or Status Network

      const tx = await this.signer.sendTransaction({
        to: to,
        data: data,
        gasLimit: config.blockchain.gasLimit,
        gasPrice: config.blockchain.gasPrice,
      });

      const receipt = await tx.wait();

      console.log(`✅ Meta-transaction executed: ${receipt.transactionHash}`);
      return receipt.transactionHash;

    } catch (error) {
      console.error('❌ Relayer error:', error.message);
      throw error;
    }
  }

  /**
   * Validate meta-transaction signature
   * @param {string} message - Original message
   * @param {string} signature - Signature to validate
   * @param {string} expectedAddress - Expected signer address
   * @returns {boolean} - True if signature is valid
   */
  async validateSignature(message, signature, expectedAddress) {
    try {
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);

      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
      console.error('❌ Signature validation error:', error.message);
      return false;
    }
  }

  /**
   * Get current gas price
   * @returns {Promise<string>} - Current gas price in wei
   */
  async getGasPrice() {
    try {
      const gasPrice = await this.provider.getGasPrice();
      return gasPrice.toString();
    } catch (error) {
      console.error('❌ Gas price fetch error:', error.message);
      return config.blockchain.gasPrice.toString();
    }
  }

  /**
   * Estimate gas for transaction
   * @param {string} to - Target address
   * @param {string} data - Transaction data
   * @returns {Promise<number>} - Estimated gas
   */
  async estimateGas(to, data) {
    try {
      const gasEstimate = await this.provider.estimateGas({
        to: to,
        data: data,
      });

      return gasEstimate.toNumber();
    } catch (error) {
      console.error('❌ Gas estimation error:', error.message);
      return config.blockchain.gasLimit;
    }
  }

  /**
   * Check if address is trusted forwarder
   * @param {string} address - Address to check
   * @returns {boolean} - True if trusted forwarder
   */
  isTrustedForwarder(address) {
    return address.toLowerCase() === this.trustedForwarder.toLowerCase();
  }

  /**
   * Get relayer wallet address
   * @returns {string} - Relayer wallet address
   */
  getAddress() {
    return this.signer.address;
  }

  /**
   * Get relayer balance
   * @returns {Promise<string>} - Balance in ETH
   */
  async getBalance() {
    try {
      const balance = await this.signer.getBalance();
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('❌ Balance fetch error:', error.message);
      return '0';
    }
  }
}

const relayerService = new RelayerService();

export default relayerService;
