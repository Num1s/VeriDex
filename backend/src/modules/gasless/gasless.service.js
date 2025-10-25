import { Transaction, User, Car, Listing } from '../../database/models/index.js';
import relayerService from '../../config/relayer.config.js';
import web3Service from '../../utils/web3.js';
import config from '../../config/index.js';
import ipfsService from '../../config/ipfs.config.js';
import contractService from '../../services/contract.service.js';
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
      console.log('🚀 Starting real car minting for user:', userId);
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

        // Upload images to IPFS if provided
        console.log('📸 Images received in gasless service:', images ? images.length : 0, 'files');
        const imageHashes = [];
        if (images && images.length > 0) {
          console.log('🔄 Starting IPFS upload for', images.length, 'images...');
          for (const image of images) {
            if (image.buffer) {
              console.log('📤 Uploading:', image.originalname, 'Size:', image.size, 'bytes');
              const hash = await ipfsService.uploadFile(image.buffer, image.originalname);
              imageHashes.push({
                url: ipfsService.getUrl(hash),
                hash,
                filename: image.originalname,
              });
              console.log('✅ Uploaded:', image.originalname, 'Hash:', hash);
            } else {
              console.log('⚠️ Image has no buffer:', image.originalname);
            }
          }
          console.log('✅ All images uploaded. Total:', imageHashes.length);
        } else {
          console.log('⚠️ No images provided to gasless service');
        }

        // Create metadata JSON
        const metadata = {
          name: `${carData.year} ${carData.make} ${carData.model}`,
          description: carData.description || `Tokenized ${carData.year} ${carData.make} ${carData.model}`,
          image: imageHashes[0]?.url || '',
          attributes: [
            { trait_type: 'Make', value: carData.make },
            { trait_type: 'Model', value: carData.model },
            { trait_type: 'Year', value: parseInt(carData.year) },
            { trait_type: 'VIN', value: vinValidation.valid ? vinValidation.formatted : carData.vin },
            { trait_type: 'Color', value: carData.color || '' },
            { trait_type: 'Verified', value: false },
          ],
          images: imageHashes,
          vin: vinValidation.valid ? vinValidation.formatted : carData.vin,
          make: carData.make,
          model: carData.model,
          year: parseInt(carData.year),
          color: carData.color,
          mileage: parseInt(carData.mileage) || 0,
          engineType: carData.engineType,
          transmission: carData.transmission,
          fuelType: carData.fuelType,
        };

        // Upload metadata to IPFS
        let metadataURI = 'mock://metadata-uri';
        if (imageHashes.length > 0) {
          console.log('🔄 Uploading metadata to IPFS...');
          const metadataHash = await ipfsService.uploadMetadata(metadata);
          metadataURI = ipfsService.getUrl(metadataHash);
          console.log('✅ Metadata uploaded:', metadataURI);
        }

        // Save car to database first
        console.log('🔍 Car data received:', {
          vin: carData.vin,
          make: carData.make,
          model: carData.model,
          year: carData.year
        });
        
        // Ensure VIN is exactly 17 characters
        let vin = carData.vin || '';
        if (vin.length < 17) {
          vin = vin.padEnd(17, '0');
        } else if (vin.length > 17) {
          vin = vin.substring(0, 17);
        }
        vin = vin.toUpperCase();
        
        const carDataToSave = {
          tokenId: null, // Will be set after blockchain mint
          vin: vin,
          make: carData.make || 'Unknown',
          model: carData.model || 'Unknown',
          year: parseInt(carData.year) || new Date().getFullYear(),
          color: carData.color || '',
          mileage: parseInt(carData.mileage) || 0,
          engineType: carData.engineType || '',
          transmission: carData.transmission || '',
          fuelType: carData.fuelType || '',
          description: carData.description || '',
          metadataURI,
          images: imageHashes,
          documents: [],
          verificationStatus: 'pending',
          verifiedBy: null,
          verifiedAt: null,
          isListed: carData.price ? true : false, // Auto-list if price provided
          listingPrice: carData.price ? carData.price.toString() : null,
          listingId: null,
          ownerAddress: user.walletAddress.toLowerCase(),
          createdBy: userId,
          blockchainStatus: 'pending',
        };

        console.log('💾 Saving car to database with', imageHashes.length, 'images');
        console.log('Images to save:', imageHashes.map(img => ({ url: img.url, hash: img.hash })));

        const savedCar = await Car.create(carDataToSave);
        console.log('✅ Car saved to database with ID:', savedCar.id, 'ownerAddress:', savedCar.ownerAddress);

        // Now mint the NFT on blockchain
        console.log('🚀 Minting CarNFT on blockchain...');
        const mintResult = await contractService.mintCarNFT(
          user.walletAddress,
          savedCar.vin,
          savedCar.make,
          savedCar.model,
          savedCar.year,
          savedCar.metadataURI
        );

        console.log('✅ CarNFT minted successfully:', mintResult);

        // Update car with blockchain data
        await savedCar.update({
          tokenId: mintResult.tokenId,
          blockchainStatus: 'confirmed',
        });

        // Create transaction record
        await Transaction.create({
          type: 'mint',
          status: 'confirmed',
          fromAddress: user.walletAddress,
          contractAddress: config.contracts.carNFT,
          methodName: 'mintCar',
          parameters: {
            to: user.walletAddress,
            vin: savedCar.vin,
            make: savedCar.make,
            model: savedCar.model,
            year: savedCar.year,
            metadataURI: savedCar.metadataURI,
          },
          txHash: mintResult.txHash,
          blockNumber: mintResult.blockNumber,
          gasUsed: mintResult.gasUsed,
          isGasless: true,
          relayerAddress: relayerService.getAddress(),
          metadata: {
            tokenId: mintResult.tokenId,
            carId: savedCar.id,
          },
          createdBy: userId,
        });

        console.log('✅ Transaction record created for minting');

        // Verify the car was updated
        const verifyCar = await Car.findByPk(savedCar.id);
        console.log('✅ Verification - car updated with tokenId:', verifyCar.tokenId);

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
          hash: mintResult.txHash,
          to: config.contracts.carNFT,
          data: '0x',
          gasLimit: '300000',
          gasPrice: '20000000000',
          status: 'confirmed',
          blockNumber: mintResult.blockNumber,
        },
        estimatedGas: mintResult.gasUsed,
        carData: {
          vin: savedCar.vin,
          make: savedCar.make,
          model: savedCar.model,
          year: savedCar.year,
          tokenId: mintResult.tokenId,
          metadataURI: savedCar.metadataURI,
          images: imageHashes,
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

      // Find car in database
      const car = await Car.findOne({
        where: {
          tokenId: parseInt(tokenId),
          ownerAddress: user.walletAddress.toLowerCase(),
        },
      });

      if (!car) {
        throw new Error('Car not found or not owned by user');
      }

      if (car.verificationStatus !== 'approved') {
        throw new Error('Only verified cars can be listed');
      }

      if (car.isListed) {
        throw new Error('Car is already listed');
      }

      console.log(`🏪 Creating marketplace listing for token ${tokenId} at ${price} ETH`);

      // First, approve NFT to marketplace contract
      console.log('✅ Approving NFT to marketplace...');
      const approvalResult = await contractService.approveNFTToMarketplace(tokenId);
      console.log('✅ NFT approved:', approvalResult.txHash);

      // Create marketplace listing
      console.log('📝 Creating marketplace listing...');
      const listingResult = await contractService.createMarketplaceListing(tokenId, price);
      console.log('✅ Marketplace listing created:', listingResult.txHash);

      // Update car in database
      await car.update({
        isListed: true,
        listingPrice: price,
        listingId: listingResult.listingId,
        blockchainStatus: 'confirmed',
      });

      // Create transaction record
      await Transaction.create({
        type: 'listing',
        status: 'confirmed',
        fromAddress: user.walletAddress,
        contractAddress: config.contracts.marketplace,
        methodName: 'createListing',
        parameters: {
          tokenId: parseInt(tokenId),
          price: web3Service.parseEther(price).toString(),
        },
        txHash: listingResult.txHash,
        blockNumber: listingResult.blockNumber,
        gasUsed: listingResult.gasUsed,
        isGasless: true,
        relayerAddress: relayerService.getAddress(),
        metadata: {
          listingId: listingResult.listingId,
          carId: car.id,
          price,
        },
        createdBy: userId,
      });

      console.log('✅ Transaction record created for listing');

      return {
        transaction: {
          hash: listingResult.txHash,
          to: config.contracts.marketplace,
          data: '0x',
          gasLimit: '300000',
          gasPrice: '20000000000',
          status: 'confirmed',
          blockNumber: listingResult.blockNumber,
        },
        estimatedGas: listingResult.gasUsed,
        listingData: {
          listingId: listingResult.listingId,
          tokenId: parseInt(tokenId),
          price,
          seller: user.walletAddress,
        },
      };
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

      // Find listing in database
      const listing = await Listing.findOne({
        where: { listingId: parseInt(listingId) },
        include: [{ model: Car, as: 'car' }],
      });

      if (!listing) {
        throw new Error('Listing not found');
      }

      if (listing.status !== 'active') {
        throw new Error('Listing is not active');
      }

      if (listing.sellerAddress.toLowerCase() === user.walletAddress.toLowerCase()) {
        throw new Error('Cannot purchase own listing');
      }

      console.log(`🛒 Purchasing listing ${listingId} for ${price} ETH${useEscrow ? ' with escrow' : ''}`);

      // Execute purchase on blockchain
      let purchaseResult;
      if (useEscrow) {
        console.log('🔒 Purchasing with escrow...');
        purchaseResult = await contractService.purchaseListingWithEscrow(listingId, price);
      } else {
        console.log('💳 Purchasing directly...');
        purchaseResult = await contractService.purchaseListingDirect(listingId, price);
      }

      console.log('✅ Purchase completed:', purchaseResult.txHash);

      // Update listing status
      await listing.update({
        status: 'sold',
        soldAt: new Date(),
        soldTo: user.walletAddress,
        isEscrow: useEscrow,
        blockchainStatus: 'confirmed',
      });

      // Update car ownership
      if (listing.car) {
        await listing.car.update({
          ownerAddress: user.walletAddress.toLowerCase(),
          isListed: false,
          listingPrice: null,
          listingId: null,
          isEscrow: useEscrow,
          escrowDealId: useEscrow ? Date.now() : null, // Simplified
        });
      }

      // Update buyer purchase count
      await user.update({
        totalPurchases: user.totalPurchases + 1,
      });

      // Create transaction record
      await Transaction.create({
        type: 'purchase',
        status: 'confirmed',
        fromAddress: user.walletAddress,
        toAddress: listing.sellerAddress,
        amount: price,
        tokenId: listing.tokenId,
        listingId: listing.listingId,
        contractAddress: config.contracts.marketplace,
        methodName: useEscrow ? 'purchaseWithEscrow' : 'purchaseListing',
        parameters: {
          listingId: parseInt(listingId),
          price: web3Service.parseEther(price).toString(),
          useEscrow,
        },
        txHash: purchaseResult.txHash,
        blockNumber: purchaseResult.blockNumber,
        gasUsed: purchaseResult.gasUsed,
        isGasless: true,
        relayerAddress: relayerService.getAddress(),
        metadata: {
          platformFee: listing.platformFee,
          netAmount: listing.netAmount,
          useEscrow,
        },
        createdBy: userId,
      });

      console.log('✅ Transaction record created for purchase');

      return {
        transaction: {
          hash: purchaseResult.txHash,
          to: config.contracts.marketplace,
          data: '0x',
          gasLimit: '300000',
          gasPrice: '20000000000',
          status: 'confirmed',
          blockNumber: purchaseResult.blockNumber,
        },
        estimatedGas: purchaseResult.gasUsed,
        purchaseData: {
          listingId: parseInt(listingId),
          tokenId: listing.tokenId,
          price,
          buyer: user.walletAddress,
          seller: listing.sellerAddress,
          useEscrow,
        },
      };
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
