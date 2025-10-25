import { Op } from 'sequelize';
import db from '../../config/db.config.cjs';
const { sequelize } = db;
import { Car, User, Transaction } from '../../database/models/index.js';
import ipfsService from '../../config/ipfs.config.js';
import web3Service from '../../utils/web3.js';
import { validateCarData, validateAndFormatVIN } from '../../utils/validators.js';
import relayerService from '../../config/relayer.config.js';

class CarsService {
  /**
   * Create new car NFT
   * @param {Object} carData - Car data
   * @param {string} userId - User ID
   * @param {Array} images - Uploaded images
   * @returns {Promise<Object>} - Created car data
   */
  async createCar(carData, userId, images = []) {
    try {
      // Validate input data
      const validation = validateCarData(carData);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Format VIN
      const vinValidation = validateAndFormatVIN(carData.vin);
      if (!vinValidation.valid) {
        throw new Error(vinValidation.error);
      }

      // Find user
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if VIN already exists
      const existingCar = await Car.findOne({
        where: { vin: vinValidation.formatted }
      });

      if (existingCar) {
        throw new Error('Car with this VIN already exists');
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

      // Prepare blockchain transaction data
      const contractInterface = [
        'function mintCar(address to, string vin, string make, string model, uint16 year, string metadataURI) returns (uint256)',
      ];

      const encodedData = web3Service.encodeFunctionCall(
        contractInterface,
        'mintCar',
        [
          user.walletAddress,
          vinValidation.formatted,
          carData.make,
          carData.model,
          carData.year,
          metadataURI,
        ]
      );

      // In a real implementation, this would send the transaction to the blockchain
      // For now, we'll create a pending transaction record
      const transaction = await Transaction.create({
        type: 'mint',
        status: 'pending',
        fromAddress: user.walletAddress,
        contractAddress: process.env.CAR_NFT_ADDRESS,
        methodName: 'mintCar',
        parameters: {
          to: user.walletAddress,
          vin: vinValidation.formatted,
          make: carData.make,
          model: carData.model,
          year: carData.year,
          metadataURI,
        },
        metadata: {
          images: imageHashes,
          metadata,
        },
        isGasless: true,
        createdBy: userId,
      });

      // Create car record in database
      const car = await Car.create({
        ownerAddress: user.walletAddress,
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
        metadataURI,
        images: imageHashes,
        documents: carData.documents || [],
        verificationStatus: 'pending',
        createdBy: userId,
        updatedBy: userId,
      });

      // Update user car count
      await user.update({
        totalCars: user.totalCars + 1,
      });

      return {
        car: {
          id: car.id,
          tokenId: car.tokenId,
          ownerAddress: car.ownerAddress,
          vin: car.vin,
          make: car.make,
          model: car.model,
          year: car.year,
          color: car.color,
          metadataURI: car.metadataURI,
          images: car.images,
          verificationStatus: car.verificationStatus,
          createdAt: car.createdAt,
        },
        transaction: {
          id: transaction.id,
          txHash: transaction.txHash,
          status: transaction.status,
        },
        metadata,
      };
    } catch (error) {
      console.error('Create car error:', error.message);
      throw error;
    }
  }

  /**
   * Get car details by ID
   * @param {string} carId - Car ID
   * @param {string} userId - User ID (optional)
   * @returns {Promise<Object>} - Car details
   */
  async getCar(carId, userId = null) {
    try {
      const car = await Car.findByPk(carId, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'walletAddress', 'firstName', 'lastName'],
          },
        ],
      });

      if (!car) {
        throw new Error('Car not found');
      }

      // Check ownership if user provided
      if (userId) {
        const user = await User.findByPk(userId);
        if (car.ownerAddress.toLowerCase() !== user.walletAddress.toLowerCase()) {
          throw new Error('Access denied');
        }
      }

      return {
        id: car.id,
        tokenId: car.tokenId,
        ownerAddress: car.ownerAddress,
        vin: car.vin,
        make: car.make,
        model: car.model,
        year: car.year,
        color: car.color,
        mileage: car.mileage,
        engineType: car.engineType,
        transmission: car.transmission,
        fuelType: car.fuelType,
        description: car.description,
        metadataURI: car.metadataURI,
        images: car.images,
        documents: car.documents,
        verificationStatus: car.verificationStatus,
        verificationNotes: car.verificationNotes,
        verifiedBy: car.verifiedBy,
        verifiedAt: car.verifiedAt,
        isListed: car.isListed,
        listingPrice: car.listingPrice,
        listingId: car.listingId,
        isEscrow: car.isEscrow,
        escrowDealId: car.escrowDealId,
        creator: car.creator,
        createdAt: car.createdAt,
        updatedAt: car.updatedAt,
      };
    } catch (error) {
      console.error('Get car error:', error.message);
      throw error;
    }
  }

  /**
   * Get user's cars
   * @param {string} userId - User ID
   * @param {Object} filters - Filters
   * @returns {Promise<Array>} - User's cars
   */
  async getUserCars(userId, filters = {}) {
    try {
      console.log('getUserCars called with userId:', userId);

      // Find user to ensure they exist
      const user = await User.findByPk(userId);
      if (!user) {
        console.log('User not found, returning empty array');
        return [];
      }
      
      console.log('User found:', user.id, user.walletAddress);

      // Query real cars from database - show cars owned by user (not just created)
      // Use Sequelize.where with Sequelize.fn for case-insensitive comparison
      const whereClause = {
        [Op.and]: [
          sequelize.where(
            sequelize.fn('LOWER', sequelize.col('ownerAddress')),
            sequelize.fn('LOWER', user.walletAddress)
          )
        ]
      };

      // Apply filters
      if (filters.verificationStatus) {
        whereClause[Op.and].push({ verificationStatus: filters.verificationStatus });
      }

      if (filters.isListed !== undefined) {
        whereClause[Op.and].push({ isListed: filters.isListed });
      }

      const limit = filters.limit || 50;
      const offset = filters.offset || 0;

      console.log('Querying cars for wallet:', user.walletAddress);
      
      const cars = await Car.findAll({
        where: whereClause,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      console.log('Found', cars.length, 'cars in database for user:', userId);
      console.log('Cars ownerAddresses:', cars.map(c => c.ownerAddress));

      // Format cars for response
      const formattedCars = cars.map(car => ({
        id: car.id,
        tokenId: car.tokenId,
        vin: car.vin,
        make: car.make,
        model: car.model,
        year: car.year,
        color: car.color,
        mileage: car.mileage,
        engineType: car.engineType,
        transmission: car.transmission,
        fuelType: car.fuelType,
        description: car.description,
        metadataURI: car.metadataURI,
        images: car.images,
        documents: car.documents,
        verificationStatus: car.verificationStatus,
        verifiedBy: car.verifiedBy,
        verifiedAt: car.verifiedAt,
        isListed: car.isListed,
        listingPrice: car.listingPrice,
        listingId: car.listingId,
        ownerAddress: car.ownerAddress,
        createdAt: car.createdAt,
        updatedAt: car.updatedAt,
      }));

      console.log('Returning', formattedCars.length, 'formatted cars');
      return formattedCars;
    } catch (error) {
      console.error('Get user cars error:', error.message);
      throw error;
    }
  }

  /**
   * Update car details
   * @param {string} carId - Car ID
   * @param {Object} updateData - Data to update
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Updated car data
   */
  async updateCar(carId, updateData, userId) {
    try {
      const car = await Car.findByPk(carId);
      if (!car) {
        throw new Error('Car not found');
      }

      // Check ownership
      const user = await User.findByPk(userId);
      if (car.ownerAddress.toLowerCase() !== user.walletAddress.toLowerCase()) {
        throw new Error('Access denied');
      }

      // Validate update data
      if (updateData.vin) {
        const vinValidation = validateAndFormatVIN(updateData.vin);
        if (!vinValidation.valid) {
          throw new Error(vinValidation.error);
        }
        updateData.vin = vinValidation.formatted;
      }

      // Update car
      await car.update({
        ...updateData,
        updatedBy: userId,
      });

      return {
        id: car.id,
        tokenId: car.tokenId,
        ownerAddress: car.ownerAddress,
        vin: car.vin,
        make: car.make,
        model: car.model,
        year: car.year,
        color: car.color,
        mileage: car.mileage,
        engineType: car.engineType,
        transmission: car.transmission,
        fuelType: car.fuelType,
        description: car.description,
        metadataURI: car.metadataURI,
        images: car.images,
        verificationStatus: car.verificationStatus,
        isListed: car.isListed,
        updatedAt: car.updatedAt,
      };
    } catch (error) {
      console.error('Update car error:', error.message);
      throw error;
    }
  }

  /**
   * Search cars
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Array>} - Search results
   */
  async searchCars(searchParams) {
    try {
      const whereClause = {};

      // Apply search filters
      if (searchParams.make) {
        whereClause.make = {
          [Op.iLike]: `%${searchParams.make}%`,
        };
      }

      if (searchParams.model) {
        whereClause.model = {
          [Op.iLike]: `%${searchParams.model}%`,
        };
      }

      if (searchParams.year) {
        whereClause.year = searchParams.year;
      }

      if (searchParams.minPrice || searchParams.maxPrice) {
        whereClause.listingPrice = {};
        if (searchParams.minPrice) {
          whereClause.listingPrice[Op.gte] = searchParams.minPrice;
        }
        if (searchParams.maxPrice) {
          whereClause.listingPrice[Op.lte] = searchParams.maxPrice;
        }
      }

      if (searchParams.verificationStatus) {
        whereClause.verificationStatus = searchParams.verificationStatus;
      }

      if (searchParams.isListed !== undefined) {
        whereClause.isListed = searchParams.isListed;
      }

      const cars = await Car.findAll({
        where: whereClause,
        order: [
          ['isListed', 'DESC'],
          ['createdAt', 'DESC'],
        ],
        limit: searchParams.limit || 20,
        offset: searchParams.offset || 0,
      });

      return cars.map(car => ({
        id: car.id,
        tokenId: car.tokenId,
        ownerAddress: car.ownerAddress,
        vin: car.vin,
        make: car.make,
        model: car.model,
        year: car.year,
        color: car.color,
        metadataURI: car.metadataURI,
        images: car.images,
        verificationStatus: car.verificationStatus,
        isListed: car.isListed,
        listingPrice: car.listingPrice,
        createdAt: car.createdAt,
      }));
    } catch (error) {
      console.error('Search cars error:', error.message);
      throw error;
    }
  }

  /**
   * Get car statistics
   * @returns {Promise<Object>} - Car statistics
   */
  async getCarStats() {
    try {
      const totalCars = await Car.count();
      const verifiedCars = await Car.count({
        where: { verificationStatus: 'approved' }
      });
      const listedCars = await Car.count({
        where: { isListed: true }
      });
      const pendingVerifications = await Car.count({
        where: { verificationStatus: 'pending' }
      });

      return {
        totalCars,
        verifiedCars,
        listedCars,
        pendingVerifications,
        verificationRate: totalCars > 0 ? (verifiedCars / totalCars * 100).toFixed(2) : 0,
      };
    } catch (error) {
      console.error('Get car stats error:', error.message);
      throw error;
    }
  }

  /**
   * Transfer car ownership
   * @param {string} carId - Car ID
   * @param {string} newOwnerAddress - New owner wallet address
   * @param {string} userId - Current owner user ID
   * @returns {Promise<Object>} - Updated car data
   */
  async transferOwnership(carId, newOwnerAddress, userId) {
    try {
      console.log('Transfer ownership:', { carId, newOwnerAddress, userId });

      // Find car
      const car = await Car.findByPk(carId);
      if (!car) {
        throw new Error('Car not found');
      }

      // Find current owner
      const currentOwner = await User.findByPk(userId);
      if (!currentOwner) {
        throw new Error('Current owner not found');
      }

      // Verify ownership
      if (car.ownerAddress.toLowerCase() !== currentOwner.walletAddress.toLowerCase()) {
        throw new Error('You do not own this asset');
      }

      // Validate new owner address
      if (!newOwnerAddress || newOwnerAddress.length !== 42) {
        throw new Error('Invalid wallet address');
      }

      // Normalize address
      const normalizedNewOwner = newOwnerAddress.toLowerCase();

      // Find or create new owner user
      let newOwner = await User.findOne({ where: { walletAddress: normalizedNewOwner } });
      
      if (!newOwner) {
        // Create new user for the new owner
        newOwner = await User.create({
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          walletAddress: normalizedNewOwner,
          nonce: null,
          isVerified: false,
          kycStatus: 'not_submitted',
          totalCars: 0,
          totalListings: 0,
          totalPurchases: 0,
          reputationScore: 5.0,
          isBlocked: false,
          preferences: {},
        });
        console.log('Created new owner user:', newOwner.id);
      }

      // Update car ownership
      await car.update({
        ownerAddress: normalizedNewOwner,
        isListed: false, // Remove from listing after transfer
        listingPrice: null,
        listingId: null,
        updatedBy: userId,
      });

      console.log('Ownership transferred successfully');

      return {
        id: car.id,
        tokenId: car.tokenId,
        vin: car.vin,
        make: car.make,
        model: car.model,
        year: car.year,
        ownerAddress: car.ownerAddress,
        previousOwner: currentOwner.walletAddress,
        newOwner: normalizedNewOwner,
        updatedAt: car.updatedAt,
      };
    } catch (error) {
      console.error('Transfer ownership error:', error.message);
      throw error;
    }
  }
}

const carsService = new CarsService();

export default carsService;
