import { Op } from 'sequelize';
import { Listing, Car, User, Transaction } from '../../database/models/index.js';
import web3Service from '../../utils/web3.js';
import config from '../../config/index.js';
import relayerService from '../../config/relayer.config.js';
import contractService from '../../services/contract.service.js';

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

      // Create blockchain listing
      try {
        console.log('🏪 Creating marketplace listing on blockchain...');
        
        // First, approve NFT to marketplace contract
        console.log('✅ Approving NFT to marketplace...');
        const approvalResult = await contractService.approveNFTToMarketplace(listingData.tokenId);
        console.log('✅ NFT approved:', approvalResult.txHash);

        // Create marketplace listing
        console.log('📝 Creating marketplace listing...');
        const listingResult = await contractService.createMarketplaceListing(listingData.tokenId, listingData.price);
        console.log('✅ Marketplace listing created:', listingResult.txHash);

        // Update listing with blockchain data
        await listing.update({
          blockchainStatus: 'confirmed',
          txHash: listingResult.txHash,
          blockNumber: listingResult.blockNumber,
        });

        // Create transaction record
        await Transaction.create({
          type: 'listing',
          status: 'confirmed',
          fromAddress: user.walletAddress,
          contractAddress: config.contracts.marketplace,
          methodName: 'createListing',
          parameters: {
            tokenId: listingData.tokenId,
            price: web3Service.parseEther(listingData.price).toString(),
          },
          txHash: listingResult.txHash,
          blockNumber: listingResult.blockNumber,
          gasUsed: listingResult.gasUsed,
          isGasless: true,
          relayerAddress: relayerService.getAddress(),
          metadata: {
            listingId,
            carId: car.id,
          },
          createdBy: userId,
        });

        console.log('✅ Transaction record created for listing');
      } catch (error) {
        console.error('❌ Marketplace listing creation error:', error.message);
        // Update listing status to failed
        await listing.update({
          blockchainStatus: 'failed',
        });
        throw new Error(`Failed to create blockchain listing: ${error.message}`);
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
      console.log('Getting active listings with filters:', filters);
      
      // For demo/development: return all cars from database as "listings"
      // This shows cars on the homepage even if they're not officially listed
      const whereClause = {};
      
      // Apply filters
      if (filters.make) {
        whereClause.make = { [Op.iLike]: `%${filters.make}%` };
      }
      if (filters.model) {
        whereClause.model = { [Op.iLike]: `%${filters.model}%` };
      }
      if (filters.year) {
        whereClause.year = parseInt(filters.year);
      }
      if (filters.verificationStatus) {
        whereClause.verificationStatus = filters.verificationStatus;
      }
      
      const limit = filters.limit || 20;
      const offset = filters.offset || 0;
      
      // Get all cars as "mock listings"
      const cars = await Car.findAll({
        where: whereClause,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });
      
      console.log(`Found ${cars.length} cars to display as listings`);
      
      // Format cars as listings
      const mockListings = cars.map(car => {
        // Parse price as number if it exists, otherwise use mock price
        const price = car.listingPrice ? parseFloat(car.listingPrice) : 0.1;
        
        return {
          id: car.id,
          listingId: car.tokenId || Math.floor(Math.random() * 1000000),
          tokenId: car.tokenId,
          title: `${car.year} ${car.make} ${car.model}`,
          make: car.make,
          model: car.model,
          year: car.year,
          price: price, // Always return as number
          listingPrice: price, // Always return as number
          sellerAddress: car.ownerAddress,
          ownerAddress: car.ownerAddress,
          status: 'active',
          description: car.description || `${car.year} ${car.make} ${car.model}`,
          images: car.images || [],
          features: [],
          condition: 'good',
          mileage: car.mileage,
          vin: car.vin,
          color: car.color,
          verificationStatus: car.verificationStatus,
          isListed: car.isListed,
          metadataURI: car.metadataURI,
          createdAt: car.createdAt,
          updatedAt: car.updatedAt,
        };
      });
      
      return mockListings;
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
      // For mock mode, return empty array
      console.log('Mock mode: returning empty user listings for user:', userId);
      return [];
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

      // Execute purchase on blockchain
      console.log(`🛒 Purchasing listing ${listing.listingId} for ${listing.price} ETH${useEscrow ? ' with escrow' : ''}`);

      let purchaseResult;
      try {
        if (useEscrow) {
          console.log('🔒 Purchasing with escrow...');
          purchaseResult = await contractService.purchaseListingWithEscrow(listing.listingId, listing.price);
        } else {
          console.log('💳 Purchasing directly...');
          purchaseResult = await contractService.purchaseListingDirect(listing.listingId, listing.price);
        }

        console.log('✅ Purchase completed:', purchaseResult.txHash);
      } catch (error) {
        console.error('❌ Purchase failed:', error.message);
        throw new Error(`Purchase failed: ${error.message}`);
      }

      // Update listing
      await listing.update({
        status: 'sold',
        soldAt: new Date(),
        soldTo: buyer.walletAddress,
        isEscrow: useEscrow,
        blockchainStatus: 'confirmed',
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
        status: 'confirmed',
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
   * Confirm escrow release (for verifier/admin)
   * @param {string} dealId - Escrow deal ID
   * @param {string} userId - User ID (verifier)
   * @returns {Promise<Object>} - Release result
   */
  async confirmEscrowRelease(dealId, userId) {
    try {
      // Find listing with escrow
      const listing = await Listing.findOne({
        where: {
          isEscrow: true,
          status: 'sold',
        },
        include: [{ model: Car, as: 'car' }],
      });

      if (!listing) {
        throw new Error('No escrow listing found');
      }

      console.log(`🔓 Releasing escrow deal ${dealId} for listing ${listing.listingId}`);

      // Release escrow on blockchain
      const releaseResult = await contractService.releaseEscrow(dealId);
      console.log('✅ Escrow released:', releaseResult.txHash);

      // Update listing
      await listing.update({
        escrowReleased: true,
        escrowReleasedAt: new Date(),
        blockchainStatus: 'confirmed',
        updatedBy: userId,
      });

      // Update car ownership (final transfer)
      if (listing.car) {
        await listing.car.update({
          ownerAddress: listing.soldTo,
          isEscrow: false,
          escrowDealId: null,
          updatedBy: userId,
        });
      }

      // Create transaction record
      await Transaction.create({
        type: 'escrow_release',
        status: 'confirmed',
        fromAddress: config.admin.walletAddress,
        contractAddress: config.contracts.escrow,
        methodName: 'releaseEscrow',
        parameters: {
          dealId: parseInt(dealId),
        },
        txHash: releaseResult.txHash,
        blockNumber: releaseResult.blockNumber,
        gasUsed: releaseResult.gasUsed,
        isGasless: true,
        relayerAddress: relayerService.getAddress(),
        metadata: {
          dealId: parseInt(dealId),
          listingId: listing.listingId,
          tokenId: listing.tokenId,
        },
        createdBy: userId,
      });

      console.log('✅ Escrow release transaction recorded');

      return {
        dealId: parseInt(dealId),
        listingId: listing.listingId,
        tokenId: listing.tokenId,
        txHash: releaseResult.txHash,
        blockNumber: releaseResult.blockNumber,
        message: 'Escrow released successfully',
      };
    } catch (error) {
      console.error('Confirm escrow release error:', error.message);
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
