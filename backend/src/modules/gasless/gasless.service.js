import { Transaction, User, Car } from '../../database/models/index.js';
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
      // For mock mode, simulate transaction creation without database operations
      console.log('Mock mode: simulating gasless transaction creation for user:', userId);

      // Validate contract address
      if (!web3Service.isValidAddress(txData.contractAddress)) {
        throw new Error('Invalid contract address');
      }

      // Generate mock transaction hash
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;

      // Simulate successful transaction
      return {
        transaction: {
          id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          txHash: mockTxHash,
          status: 'pending',
          type: 'gasless',
          contractAddress: txData.contractAddress,
          methodName: txData.methodName,
        },
        estimatedGas: '21000', // Mock gas estimate
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
      // Mock mode: simulate car minting
      console.log('Mock mode: simulating car minting for user:', userId);

      // Mock transaction hash
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;

      // For mock mode, also save the car to database so it appears in user cars
      try {
        // Import validateCarData
        const { validateCarData } = await import('../../utils/validators.js');

        // Validate input data
        const validation = validateCarData(carData);
        if (!validation.valid) {
          console.log('Validation failed, but continuing in mock mode:', validation.errors);
        }

        // Format VIN
        const vinValidation = validateAndFormatVIN(carData.vin);
        if (!vinValidation.valid) {
          console.log('VIN validation failed, but continuing in mock mode:', vinValidation.error);
        }

        // Find user
        console.log('Looking for user:', userId);
        let user = await User.findByPk(userId);
        console.log('User found in gasless service:', !!user, user?.walletAddress);

        if (!user) {
          throw new Error('User not found. Please authenticate first.');
        }

        // Mock token ID
        const mockTokenId = Math.floor(Math.random() * 1000000);

        // Save car to database
        const carDataToSave = {
          tokenId: mockTokenId,
          vin: vinValidation.valid ? vinValidation.formatted : (carData.vin ? carData.vin.toUpperCase().substring(0, 17) : ''),
          make: carData.make,
          model: carData.model,
          year: parseInt(carData.year) || new Date().getFullYear(),
          color: carData.color || '',
          mileage: parseInt(carData.mileage) || 0,
          engineType: carData.engineType || '',
          transmission: carData.transmission || '',
          fuelType: carData.fuelType || '',
          description: carData.description || '',
          metadataURI: 'mock://metadata-uri',
          images: [],
          documents: [],
          verificationStatus: 'pending',
          verifiedBy: null,
          verifiedAt: null,
          isListed: carData.price ? true : false, // Auto-list if price provided
          listingPrice: carData.price ? carData.price.toString() : null,
          listingId: null,
          ownerAddress: user.walletAddress.toLowerCase(),
          createdBy: userId,
        };

        console.log('Mock mode: Attempting to save car with data:', JSON.stringify(carDataToSave, null, 2));

        const savedCar = await Car.create(carDataToSave);

        console.log('Mock mode: Car saved to database with ID:', savedCar.id, 'ownerAddress:', savedCar.ownerAddress);

        // Verify the car was saved by querying it back
        const verifyCar = await Car.findByPk(savedCar.id);
        console.log('Mock mode: Verification - car found in DB:', !!verifyCar);

      } catch (dbError) {
        console.error('Mock mode: Failed to save car to database:', dbError.message);
        console.error('Full error:', dbError);
        
        // Provide user-friendly error messages
        if (dbError.name === 'SequelizeUniqueConstraintError') {
          const field = dbError.errors?.[0]?.path || 'field';
          const value = dbError.errors?.[0]?.value || '';
          
          if (field === 'vin') {
            throw new Error(`This VIN (${value}) is already registered. Each car must have a unique VIN number.`);
          }
          throw new Error(`A car with this ${field} already exists.`);
        }
        
        // Re-throw the error so the user knows something went wrong
        throw new Error(`Failed to save car: ${dbError.message}`);
      }

      return {
        transaction: {
          hash: mockTxHash,
          to: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
          data: '0x',
          gasLimit: '300000',
          gasPrice: '20000000000',
          status: 'pending',
        },
        estimatedGas: '300000',
        carData: {
          vin: carData.vin,
          make: carData.make,
          model: carData.model,
          year: carData.year,
          metadataURI: 'mock://metadata-uri',
          images: [],
        },
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
      // For mock mode, simulate transaction status
      console.log('Mock mode: simulating transaction status for hash:', txHash);

      // Simulate different statuses based on hash
      const statuses = ['pending', 'confirmed', 'failed'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      return {
        id: `tx_${Date.now()}`,
        txHash,
        type: 'gasless',
        status: randomStatus,
        fromAddress: null,
        toAddress: null,
        amount: null,
        contractAddress: null,
        methodName: null,
        blockNumber: randomStatus === 'confirmed' ? 12345678 : null,
        gasUsed: randomStatus === 'confirmed' ? '21000' : null,
        isGasless: true,
        createdAt: new Date(),
        processedAt: randomStatus !== 'pending' ? new Date() : null,
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
      // For mock mode, skip database operations and return empty array
      // In a real implementation, this would query the database
      console.log('Mock mode: returning empty gasless transactions for user:', userId);

      // Return empty array for now (mock data)
      // In production, this would query the Transaction table
      return [];
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
      // For mock mode, simulate transaction cancellation
      console.log('Mock mode: simulating transaction cancellation for hash:', txHash);

      return {
        id: `tx_${Date.now()}`,
        txHash,
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
      // For mock mode, return mock statistics
      console.log('Mock mode: returning mock gasless statistics');

      return {
        totalTransactions: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        pendingTransactions: 0,
        successRate: 0,
      };
    } catch (error) {
      console.error('Get gasless stats error:', error.message);
      throw error;
    }
  }
}

const gaslessService = new GaslessService();

export default gaslessService;
