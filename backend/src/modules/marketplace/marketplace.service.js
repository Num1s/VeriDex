import { Op } from 'sequelize';
import { Listing, Car, User, Transaction } from '../../database/models/index.js';
import web3Service from '../../utils/web3.js';
import config from '../../config/index.js';
import relayerService from '../../config/relayer.config.js';

class MarketplaceService {
  /**
   * Create new listing
   * @param {Object} listingData - Listing data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Created listing
   */
  async createListing(listingData, userId) {
    try {
      // Find user
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Find car
      const car = await Car.findOne({
        where: {
          tokenId: listingData.tokenId,
          ownerAddress: user.walletAddress,
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

      // Validate price
      if (!listingData.price || parseFloat(listingData.price) <= 0) {
        throw new Error('Valid price is required');
      }

      // Get next listing ID
      const lastListing = await Listing.findOne({
        order: [['listingId', 'DESC']],
      });

      const listingId = (lastListing?.listingId || 0) + 1;

      // Calculate fees
      const platformFeeRate = 0.02; // 2%
      const platformFee = parseFloat(listingData.price) * platformFeeRate;
      const netAmount = parseFloat(listingData.price) - platformFee;

      // Create listing record
      const listing = await Listing.create({
        listingId,
        tokenId: listingData.tokenId,
        sellerAddress: user.walletAddress,
        price: listingData.price,
        status: 'active',
        description: listingData.description,
        images: listingData.images || [],
        features: listingData.features || [],
        condition: listingData.condition,
        mileage: listingData.mileage,
        location: listingData.location,
        platformFee: platformFee.toString(),
        netAmount: netAmount.toString(),
        blockchainStatus: 'pending',
        createdBy: userId,
        updatedBy: userId,
      });

      // Update car status
      await car.update({
        isListed: true,
        listingPrice: listingData.price,
        listingId,
        updatedBy: userId,
      });

      // Update user listing count
      await user.update({
        totalListings: user.totalListings + 1,
      });

      // Create blockchain transaction
      const contractAddress = config.contracts.marketplace;
      if (contractAddress) {
        const contractInterface = [
          'function createListing(uint256 tokenId, uint256 price) returns (uint256)',
        ];

        const transaction = await Transaction.create({
          type: 'listing',
          status: 'pending',
          fromAddress: user.walletAddress,
          contractAddress,
          methodName: 'createListing',
          parameters: {
            tokenId: listingData.tokenId,
            price: web3Service.parseEther(listingData.price).toString(),
          },
          metadata: {
            listingId,
            carId: car.id,
          },
          createdBy: userId,
        });

        // Send gasless transaction
        try {
          const encodedData = web3Service.encodeFunctionCall(
            contractInterface,
            'createListing',
            [listingData.tokenId, web3Service.parseEther(listingData.price).toString()]
          );

          const txHash = await relayerService.sendMetaTransaction(contractAddress, encodedData);

          await transaction.update({
            txHash,
            isGasless: true,
            relayerAddress: relayerService.getAddress(),
          });
        } catch (error) {
          console.error('Marketplace transaction error:', error.message);
          // Continue with database record even if blockchain fails
        }
      }

      return {
        listing: {
          id: listing.id,
          listingId: listing.listingId,
          tokenId: listing.tokenId,
          sellerAddress: listing.sellerAddress,
          price: listing.price,
          status: listing.status,
          description: listing.description,
          createdAt: listing.createdAt,
        },
        fees: {
          platformFee: platformFee.toFixed(6),
          netAmount: netAmount.toFixed(6),
          platformFeeRate: 0.02,
        },
      };
    } catch (error) {
      console.error('Create listing error:', error.message);
      throw error;
    }
  }

  /**
   * Get listing details
   * @param {string} listingId - Listing ID
   * @returns {Promise<Object>} - Listing details
   */
  async getListing(listingId) {
    try {
      const listing = await Listing.findOne({
        where: { listingId },
        include: [
          {
            model: Car,
            as: 'car',
            include: [
              {
                model: User,
                as: 'creator',
                attributes: ['id', 'walletAddress', 'firstName', 'lastName'],
              },
            ],
          },
        ],
      });

      if (!listing) {
        throw new Error('Listing not found');
      }

      return {
        id: listing.id,
        listingId: listing.listingId,
        tokenId: listing.tokenId,
        sellerAddress: listing.sellerAddress,
        price: listing.price,
        currency: listing.currency,
        status: listing.status,
        description: listing.description,
        images: listing.images,
        features: listing.features,
        condition: listing.condition,
        mileage: listing.mileage,
        location: listing.location,
        platformFee: listing.platformFee,
        netAmount: listing.netAmount,
        isEscrow: listing.isEscrow,
        blockchainStatus: listing.blockchainStatus,
        car: listing.car ? {
          id: listing.car.id,
          vin: listing.car.vin,
          make: listing.car.make,
          model: listing.car.model,
          year: listing.car.year,
          color: listing.car.color,
          metadataURI: listing.car.metadataURI,
          images: listing.car.images,
          verificationStatus: listing.car.verificationStatus,
          creator: listing.car.creator,
        } : null,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
      };
    } catch (error) {
      console.error('Get listing error:', error.message);
      throw error;
    }
  }

  /**
   * Get active listings
   * @param {Object} filters - Filters
   * @returns {Promise<Array>} - Active listings
   */
  async getActiveListings(filters = {}) {
    try {
      const whereClause = {
        status: 'active',
        blockchainStatus: 'confirmed',
      };

      // Apply filters
      if (filters.seller) {
        whereClause.sellerAddress = filters.seller.toLowerCase();
      }

      if (filters.minPrice || filters.maxPrice) {
        whereClause.price = {};
        if (filters.minPrice) {
          whereClause.price[Op.gte] = filters.minPrice;
        }
        if (filters.maxPrice) {
          whereClause.price[Op.lte] = filters.maxPrice;
        }
      }

      if (filters.make) {
        // This would require joining with Cars table
        whereClause['$car.make$'] = {
          [Op.iLike]: `%${filters.make}%`,
        };
      }

      if (filters.model) {
        whereClause['$car.model$'] = {
          [Op.iLike]: `%${filters.model}%`,
        };
      }

      if (filters.year) {
        whereClause['$car.year$'] = filters.year;
      }

      const listings = await Listing.findAll({
        where: whereClause,
        include: [
          {
            model: Car,
            as: 'car',
            where: {
              verificationStatus: 'approved',
            },
            include: [
              {
                model: User,
                as: 'creator',
                attributes: ['id', 'walletAddress', 'firstName', 'lastName'],
              },
            ],
          },
        ],
        order: [
          ['createdAt', 'DESC'],
        ],
        limit: filters.limit || 20,
        offset: filters.offset || 0,
      });

      return listings.map(listing => ({
        id: listing.id,
        listingId: listing.listingId,
        tokenId: listing.tokenId,
        sellerAddress: listing.sellerAddress,
        price: listing.price,
        description: listing.description,
        images: listing.images,
        features: listing.features,
        condition: listing.condition,
        mileage: listing.mileage,
        location: listing.location,
        car: listing.car ? {
          id: listing.car.id,
          vin: listing.car.vin,
          make: listing.car.make,
          model: listing.car.model,
          year: listing.car.year,
          color: listing.car.color,
          metadataURI: listing.car.metadataURI,
          images: listing.car.images,
          verificationStatus: listing.car.verificationStatus,
          creator: listing.car.creator,
        } : null,
        createdAt: listing.createdAt,
      }));
    } catch (error) {
      console.error('Get active listings error:', error.message);
      throw error;
    }
  }

  /**
   * Get user's listings
   * @param {string} userId - User ID
   * @param {Object} filters - Filters
   * @returns {Promise<Array>} - User's listings
   */
  async getUserListings(userId, filters = {}) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const whereClause = {
        sellerAddress: user.walletAddress,
      };

      if (filters.status) {
        whereClause.status = filters.status;
      }

      const listings = await Listing.findAll({
        where: whereClause,
        include: [
          {
            model: Car,
            as: 'car',
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: filters.limit || 50,
        offset: filters.offset || 0,
      });

      return listings.map(listing => ({
        id: listing.id,
        listingId: listing.listingId,
        tokenId: listing.tokenId,
        price: listing.price,
        status: listing.status,
        description: listing.description,
        blockchainStatus: listing.blockchainStatus,
        car: listing.car ? {
          id: listing.car.id,
          vin: listing.car.vin,
          make: listing.car.make,
          model: listing.car.model,
          year: listing.car.year,
          verificationStatus: listing.car.verificationStatus,
        } : null,
        createdAt: listing.createdAt,
        soldAt: listing.soldAt,
      }));
    } catch (error) {
      console.error('Get user listings error:', error.message);
      throw error;
    }
  }

  /**
   * Update listing
   * @param {string} listingId - Listing ID
   * @param {Object} updateData - Update data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Updated listing
   */
  async updateListing(listingId, updateData, userId) {
    try {
      const listing = await Listing.findOne({
        where: { listingId },
      });

      if (!listing) {
        throw new Error('Listing not found');
      }

      // Check ownership
      const user = await User.findByPk(userId);
      if (listing.sellerAddress.toLowerCase() !== user.walletAddress.toLowerCase()) {
        throw new Error('Access denied');
      }

      if (listing.status !== 'active') {
        throw new Error('Only active listings can be updated');
      }

      // Update listing
      await listing.update({
        ...updateData,
        updatedBy: userId,
      });

      return {
        id: listing.id,
        listingId: listing.listingId,
        tokenId: listing.tokenId,
        price: listing.price,
        status: listing.status,
        description: listing.description,
        updatedAt: listing.updatedAt,
      };
    } catch (error) {
      console.error('Update listing error:', error.message);
      throw error;
    }
  }

  /**
   * Cancel listing
   * @param {string} listingId - Listing ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Cancel result
   */
  async cancelListing(listingId, userId) {
    try {
      const listing = await Listing.findOne({
        where: { listingId },
      });

      if (!listing) {
        throw new Error('Listing not found');
      }

      // Check ownership
      const user = await User.findByPk(userId);
      if (listing.sellerAddress.toLowerCase() !== user.walletAddress.toLowerCase()) {
        throw new Error('Access denied');
      }

      if (listing.status !== 'active') {
        throw new Error('Only active listings can be cancelled');
      }

      // Update listing status
      await listing.update({
        status: 'cancelled',
        updatedBy: userId,
      });

      // Update car status
      await Car.update(
        {
          isListed: false,
          listingPrice: null,
          listingId: null,
          updatedBy: userId,
        },
        {
          where: { tokenId: listing.tokenId },
        }
      );

      return {
        listingId: listing.listingId,
        status: 'cancelled',
        message: 'Listing cancelled successfully',
      };
    } catch (error) {
      console.error('Cancel listing error:', error.message);
      throw error;
    }
  }

  /**
   * Purchase listing
   * @param {string} listingId - Listing ID
   * @param {string} buyerId - Buyer ID
   * @param {boolean} useEscrow - Whether to use escrow
   * @returns {Promise<Object>} - Purchase result
   */
  async purchaseListing(listingId, buyerId, useEscrow = false) {
    try {
      const buyer = await User.findByPk(buyerId);
      if (!buyer) {
        throw new Error('Buyer not found');
      }

      const listing = await Listing.findOne({
        where: { listingId },
        include: [
          {
            model: Car,
            as: 'car',
          },
        ],
      });

      if (!listing) {
        throw new Error('Listing not found');
      }

      if (listing.status !== 'active') {
        throw new Error('Listing is not active');
      }

      if (listing.sellerAddress.toLowerCase() === buyer.walletAddress.toLowerCase()) {
        throw new Error('Cannot purchase own listing');
      }

      // Check if buyer has sufficient balance (simplified)
      const price = parseFloat(listing.price);
      // In a real implementation, you would check buyer's balance

      // Update listing
      await listing.update({
        status: 'sold',
        soldAt: new Date(),
        soldTo: buyer.walletAddress,
        isEscrow: useEscrow,
        updatedBy: buyerId,
      });

      // Update car ownership
      await Car.update(
        {
          ownerAddress: buyer.walletAddress,
          isListed: false,
          listingPrice: null,
          listingId: null,
          isEscrow: useEscrow,
          escrowDealId: useEscrow ? Date.now() : null, // Simplified
          updatedBy: buyerId,
        },
        {
          where: { tokenId: listing.tokenId },
        }
      );

      // Update buyer purchase count
      await buyer.update({
        totalPurchases: buyer.totalPurchases + 1,
      });

      // Create transaction record
      const transaction = await Transaction.create({
        type: 'purchase',
        status: 'pending',
        fromAddress: buyer.walletAddress,
        toAddress: listing.sellerAddress,
        amount: listing.price,
        tokenId: listing.tokenId,
        listingId: listing.listingId,
        contractAddress: config.contracts.marketplace,
        methodName: useEscrow ? 'purchaseWithEscrow' : 'purchaseListing',
        parameters: {
          listingId: listing.listingId,
          price: listing.price,
          useEscrow,
        },
        metadata: {
          platformFee: listing.platformFee,
          netAmount: listing.netAmount,
        },
        createdBy: buyerId,
      });

      return {
        listing: {
          listingId: listing.listingId,
          tokenId: listing.tokenId,
          price: listing.price,
          seller: listing.sellerAddress,
          buyer: buyer.walletAddress,
        },
        transaction: {
          id: transaction.id,
          txHash: transaction.txHash,
          status: transaction.status,
        },
        fees: {
          platformFee: listing.platformFee,
          netAmount: listing.netAmount,
        },
      };
    } catch (error) {
      console.error('Purchase listing error:', error.message);
      throw error;
    }
  }

  /**
   * Get marketplace statistics
   * @returns {Promise<Object>} - Marketplace statistics
   */
  async getMarketplaceStats() {
    try {
      const totalListings = await Listing.count();
      const activeListings = await Listing.count({
        where: { status: 'active' }
      });
      const soldListings = await Listing.count({
        where: { status: 'sold' }
      });
      const totalVolume = await Listing.sum('price', {
        where: { status: 'sold' }
      });

      return {
        totalListings,
        activeListings,
        soldListings,
        totalVolume: totalVolume ? parseFloat(totalVolume).toFixed(6) : '0',
        sellThroughRate: totalListings > 0 ? (soldListings / totalListings * 100).toFixed(2) : 0,
      };
    } catch (error) {
      console.error('Get marketplace stats error:', error.message);
      throw error;
    }
  }
}

const marketplaceService = new MarketplaceService();

export default marketplaceService;
