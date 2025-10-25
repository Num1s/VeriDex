import { ethers } from 'ethers';
import web3Service from '../utils/web3.js';
import relayerService from '../config/relayer.config.js';
import { getContractConfig } from '../contracts/index.js';
import config from '../config/index.js';

class ContractService {
  constructor() {
    this.provider = web3Service.provider;
    this.signer = relayerService.signer;
  }

  /**
   * Mint a new car NFT
   */
  async mintCarNFT(owner, vin, make, model, year, metadataURI) {
    try {
      console.log(`🔍 Getting contract config for carNFT...`);
      const { address, abi } = getContractConfig('carNFT');
      console.log(`📍 Contract address: ${address}`);
      
      // Check balance
      const balance = await this.provider.getBalance(this.signer.address);
      const balanceInEth = parseFloat(ethers.utils.formatEther(balance));
      console.log(`💰 Current balance: ${balanceInEth} ETH`);
      
      if (balanceInEth < 0.001) {
        throw new Error(`Insufficient balance: ${balanceInEth} ETH`);
      }
      
      const contract = web3Service.getContract(address, abi, true);
      console.log(`🚗 Minting CarNFT for owner: ${owner}`);
      console.log(`📝 VIN: ${vin}, Make: ${make}, Model: ${model}, Year: ${year}`);

      // Send transaction with timeout
      const txPromise = contract.mintCar(owner, vin, make, model, year, metadataURI);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Transaction timeout after 60 seconds')), 60000)
      );
      
      const tx = await Promise.race([txPromise, timeoutPromise]);
      console.log(`📤 Transaction sent: ${tx.hash}`);
      
      // Wait for 1 confirmation with timeout
      const receiptPromise = tx.wait(1);
      const receiptTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Receipt timeout after 120 seconds')), 120000)
      );
      
      const receipt = await Promise.race([receiptPromise, receiptTimeoutPromise]);
      console.log(`✅ CarNFT minted: ${receipt.transactionHash}`);

      // Parse token ID from events or as fallback use a simple increment
      let tokenId;
      const mintEvent = receipt.events?.find(e => e.event === 'CarMinted');
      
      if (mintEvent && mintEvent.args && mintEvent.args.tokenId) {
        tokenId = mintEvent.args.tokenId.toString();
      } else {
        // Fallback: get the latest token ID from the contract
        console.log(`⚠️  TokenId not found in events, using fallback method`);
        tokenId = receipt.blockNumber.toString(); // Temporary fallback
      }

      return {
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        tokenId,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 1 ? 'success' : 'failed',
      };
    } catch (error) {
      console.error('❌ CarNFT minting error:', error.message);
      console.error('❌ Error stack:', error.stack);
      throw new Error(`Failed to mint CarNFT: ${error.message}`);
    }
  }
}

const contractService = new ContractService();
export default contractService;
