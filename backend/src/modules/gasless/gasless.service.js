import { Transaction, User } from '../../database/models/index.js';
import relayerService from '../../config/relayer.config.js';
import web3Service from '../../utils/web3.js';
import config from '../../config/index.js';
import ipfsService from '../../config/ipfs.config.js';
import { validateAndFormatVIN } from '../../utils/validators.js';

class GaslessService {
  /**
   * Create gasless transaction
   * @param {Object} txData - Transaction data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Transaction result
   */
  async createGaslessTransaction(txData, userId) {
    try {
      // Find user
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate contract address
      if (!web3Service.isValidAddress(txData.contractAddress)) {
        throw new Error('Invalid contract address');
      }

      // Encode function call
      const encodedData = web3Service.encodeFunctionCall(
        txData.contractInterface,
        txData.methodName,
        txData.parameters
      );

      // Create transaction record
      const transaction = await Transaction.create({
        type: 'gasless',
        status: 'pending',
        fromAddress: user.walletAddress,
        contractAddress: txData.contractAddress,
        methodName: txData.methodName,
        parameters: txData.parameters,
        metadata: txData.metadata || {},
        isGasless: true,
        relayerAddress: relayerService.getAddress(),
        createdBy: userId,
      });

      // Send meta-transaction through relayer
      const txHash = await relayerService.sendMetaTransaction(
        txData.contractAddress,
        encodedData
      );

      // Update transaction with hash
      await transaction.update({
        txHash,
        status: 'pending', // Will be updated when confirmed
      });

      return {
        transaction: {
          id: transaction.id,
          txHash,
          status: transaction.status,
          type: transaction.type,
          contractAddress: transaction.contractAddress,
          methodName: transaction.methodName,
        },
        estimatedGas: await relayerService.estimateGas(txData.contractAddress, encodedData),
      };
    } catch (error) {
      console.error('Create gasless transaction error:', error.message);
      throw error;
    }
  }

  /**
   * Mint car NFT gaslessly
   * @param {Object} carData - Car data
   * @param {string} userId - User ID
   * @param {Array} images - Car images
   * @returns {Promise<Object>} - Mint result
   */
  async mintCarGasless(carData, userId, images = []) {
    try {
      // Find user
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get contract address
      const contractAddress = config.contracts.carNFT;
      if (!contractAddress) {
        throw new Error('CarNFT contract address not configured');
      }

      // Validate and format VIN
      const vinValidation = validateAndFormatVIN(carData.vin);
      if (!vinValidation.valid) {
        throw new Error(vinValidation.error);
      }

      // Upload images to IPFS if provided
      const imageHashes = [];
      if (images && images.length > 0) {
        for (const image of images) {
          if (image.buffer) {
            const hash = await ipfsService.uploadFile(image.buffer, image.originalname);
            imageHashes.push({
              url: ipfsService.getUrl(hash),
              hash,
              filename: image.originalname,
            });
          }
        }
      }

      // Create metadata JSON
      const metadata = {
        name: `${carData.year} ${carData.make} ${carData.model}`,
        description: `Tokenized ${carData.year} ${carData.make} ${carData.model}`,
        image: imageHashes[0]?.url || '',
        attributes: [
          { trait_type: 'Make', value: carData.make },
          { trait_type: 'Model', value: carData.model },
          { trait_type: 'Year', value: carData.year },
          { trait_type: 'VIN', value: vinValidation.formatted },
          { trait_type: 'Color', value: carData.color || '' },
          { trait_type: 'Verified', value: false },
        ],
        images: imageHashes,
        vin: vinValidation.formatted,
        make: carData.make,
        model: carData.model,
        year: carData.year,
        color: carData.color,
        mileage: carData.mileage,
        engineType: carData.engineType,
        transmission: carData.transmission,
        fuelType: carData.fuelType,
        description: carData.description,
      };

      // Upload metadata to IPFS
      const metadataHash = await ipfsService.uploadMetadata(metadata);
      const metadataURI = ipfsService.getUrl(metadataHash);

      // Contract interface for CarNFT mintCar function
      const contractInterface = [
        'function mintCar(address to, string vin, string make, string model, uint16 year, string metadataURI) returns (uint256)',
      ];

      // Prepare transaction data
      const txData = {
        contractAddress,
        contractInterface,
        methodName: 'mintCar',
        parameters: [
          user.walletAddress,
          vinValidation.formatted,
          carData.make,
          carData.model,
          carData.year,
          metadataURI,
        ],
        metadata: {
          carData,
          images: imageHashes,
          metadata,
          metadataURI,
        },
      };

      // Create gasless transaction
      const result = await this.createGaslessTransaction(txData, userId);

      return {
        ...result,
        carData: {
          vin: vinValidation.formatted,
          make: carData.make,
          model: carData.model,
          year: carData.year,
          metadataURI,
          images: imageHashes,
        },
        metadata,
      };
    } catch (error) {
      console.error('Mint car gasless error:', error.message);
      throw error;
    }
  }

  /**
   * List car for sale gaslessly
   * @param {string} tokenId - Token ID
   * @param {string} price - Listing price
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Listing result
   */
  async listCarGasless(tokenId, price, userId) {
    try {
      // Find user
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get contract address
      const contractAddress = config.contracts.marketplace;
      if (!contractAddress) {
        throw new Error('Marketplace contract address not configured');
      }

      // Contract interface for Marketplace createListing function
      const contractInterface = [
        'function createListing(uint256 tokenId, uint256 price) returns (uint256)',
      ];

      // Prepare transaction data
      const txData = {
        contractAddress,
        contractInterface,
        methodName: 'createListing',
        parameters: [
          tokenId,
          web3Service.parseEther(price).toString(),
        ],
        metadata: {
          tokenId,
          price,
          action: 'list_car',
        },
      };

      // Create gasless transaction
      const result = await this.createGaslessTransaction(txData, userId);

      return result;
    } catch (error) {
      console.error('List car gasless error:', error.message);
      throw error;
    }
  }

  /**
   * Purchase car gaslessly
   * @param {string} listingId - Listing ID
   * @param {string} price - Purchase price
   * @param {string} userId - User ID
   * @param {boolean} useEscrow - Whether to use escrow
   * @returns {Promise<Object>} - Purchase result
   */
  async purchaseCarGasless(listingId, price, userId, useEscrow = false) {
    try {
      // Find user
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get contract address
      const contractAddress = config.contracts.marketplace;
      if (!contractAddress) {
        throw new Error('Marketplace contract address not configured');
      }

      // Choose method based on escrow preference
      const methodName = useEscrow ? 'purchaseWithEscrow' : 'purchaseListing';
      const contractInterface = useEscrow
        ? ['function purchaseWithEscrow(uint256 listingId)']
        : ['function purchaseListing(uint256 listingId)'];

      // Prepare transaction data
      const txData = {
        contractAddress,
        contractInterface,
        methodName,
        parameters: [listingId],
        metadata: {
          listingId,
          price,
          useEscrow,
          action: 'purchase_car',
        },
      };

      // Create gasless transaction
      const result = await this.createGaslessTransaction(txData, userId);

      return result;
    } catch (error) {
      console.error('Purchase car gasless error:', error.message);
      throw error;
    }
  }

  /**
   * Get gasless transaction status
   * @param {string} txHash - Transaction hash
   * @returns {Promise<Object>} - Transaction status
   */
  async getTransactionStatus(txHash) {
    try {
      // Find transaction in database
      const transaction = await Transaction.findOne({
        where: { txHash },
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Get current status from blockchain
      const receipt = await web3Service.getTransactionReceipt(txHash);

      let status = transaction.status;
      if (receipt && receipt.blockNumber) {
        status = receipt.status ? 'confirmed' : 'failed';
      }

      // Update transaction if status changed
      if (status !== transaction.status) {
        await transaction.update({
          status,
          blockNumber: receipt ? receipt.blockNumber : null,
          blockHash: receipt ? receipt.blockHash : null,
          gasUsed: receipt ? receipt.gasUsed.toString() : null,
          gasPrice: receipt ? receipt.gasPrice.toString() : null,
          processedAt: new Date(),
        });
      }

      return {
        id: transaction.id,
        txHash: transaction.txHash,
        type: transaction.type,
        status,
        fromAddress: transaction.fromAddress,
        toAddress: transaction.toAddress,
        amount: transaction.amount,
        contractAddress: transaction.contractAddress,
        methodName: transaction.methodName,
        blockNumber: receipt ? receipt.blockNumber : null,
        gasUsed: receipt ? receipt.gasUsed.toString() : null,
        isGasless: transaction.isGasless,
        createdAt: transaction.createdAt,
        processedAt: transaction.processedAt,
      };
    } catch (error) {
      console.error('Get transaction status error:', error.message);
      throw error;
    }
  }

  /**
   * Get user's gasless transactions
   * @param {string} userId - User ID
   * @param {Object} filters - Filters
   * @returns {Promise<Array>} - User's transactions
   */
  async getUserTransactions(userId, filters = {}) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const whereClause = {
        createdBy: userId,
        isGasless: true,
      };

      // Apply filters
      if (filters.type) {
        whereClause.type = filters.type;
      }

      if (filters.status) {
        whereClause.status = filters.status;
      }

      const transactions = await Transaction.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit: filters.limit || 50,
        offset: filters.offset || 0,
      });

      return transactions.map(tx => ({
        id: tx.id,
        txHash: tx.txHash,
        type: tx.type,
        status: tx.status,
        amount: tx.amount,
        contractAddress: tx.contractAddress,
        methodName: tx.methodName,
        blockNumber: tx.blockNumber,
        gasUsed: tx.gasUsed,
        createdAt: tx.createdAt,
        processedAt: tx.processedAt,
      }));
    } catch (error) {
      console.error('Get user transactions error:', error.message);
      throw error;
    }
  }

  /**
   * Cancel gasless transaction
   * @param {string} txHash - Transaction hash
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Cancel result
   */
  async cancelTransaction(txHash, userId) {
    try {
      // Find transaction
      const transaction = await Transaction.findOne({
        where: {
          txHash,
          createdBy: userId,
          status: 'pending',
        },
      });

      if (!transaction) {
        throw new Error('Transaction not found or cannot be cancelled');
      }

      // Update transaction status
      await transaction.update({
        status: 'cancelled',
        processedAt: new Date(),
      });

      return {
        id: transaction.id,
        txHash: transaction.txHash,
        status: 'cancelled',
        message: 'Transaction cancelled successfully',
      };
    } catch (error) {
      console.error('Cancel transaction error:', error.message);
      throw error;
    }
  }

  /**
   * Get gasless service statistics
   * @returns {Promise<Object>} - Service statistics
   */
  async getGaslessStats() {
    try {
      const totalTransactions = await Transaction.count({
        where: { isGasless: true }
      });

      const successfulTransactions = await Transaction.count({
        where: {
          isGasless: true,
          status: 'confirmed',
        },
      });

      const failedTransactions = await Transaction.count({
        where: {
          isGasless: true,
          status: 'failed',
        },
      });

      const pendingTransactions = await Transaction.count({
        where: {
          isGasless: true,
          status: 'pending',
        },
      });

      return {
        totalTransactions,
        successfulTransactions,
        failedTransactions,
        pendingTransactions,
        successRate: totalTransactions > 0
          ? (successfulTransactions / totalTransactions * 100).toFixed(2)
          : 0,
      };
    } catch (error) {
      console.error('Get gasless stats error:', error.message);
      throw error;
    }
  }
}

const gaslessService = new GaslessService();

export default gaslessService;
