import marketplaceService from './marketplace.service.js';
import { authenticate } from '../auth/auth.middleware.js';
import { Listing, Car, User } from '../../database/models/index.js';

class MarketplaceController {
  /**
   * Create new listing
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async createListing(req, res, next) {
    try {
      const { userId } = req.user;
      const listingData = req.body;

      const result = await marketplaceService.createListing(listingData, userId);

      res.status(201).json({
        success: true,
        message: 'Listing created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get listing details
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getListing(req, res, next) {
    try {
      const { listingId } = req.params;

      if (!listingId) {
        return res.status(400).json({
          success: false,
          message: 'Listing ID is required',
        });
      }

      const listing = await marketplaceService.getListing(listingId);

      res.status(200).json({
        success: true,
        message: 'Listing retrieved successfully',
        data: listing,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get active listings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getActiveListings(req, res, next) {
    try {
      const {
        seller,
        make,
        model,
        year,
        minPrice,
        maxPrice,
        limit = 20,
        offset = 0,
      } = req.query;

      const filters = {
        seller,
        make,
        model,
        year: year ? parseInt(year) : undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        limit: parseInt(limit),
        offset: parseInt(offset),
      };

      const listings = await marketplaceService.getActiveListings(filters);

      res.status(200).json({
        success: true,
        message: 'Active listings retrieved successfully',
        data: listings,
        filters,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's listings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getUserListings(req, res, next) {
    try {
      const { userId } = req.user;
      const {
        status,
        limit = 20,
        offset = 0,
      } = req.query;

      const filters = {
        status,
        limit: parseInt(limit),
        offset: parseInt(offset),
      };

      const listings = await marketplaceService.getUserListings(userId, filters);

      res.status(200).json({
        success: true,
        message: 'User listings retrieved successfully',
        data: listings,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update listing
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async updateListing(req, res, next) {
    try {
      const { listingId } = req.params;
      const { userId } = req.user;
      const updateData = req.body;

      const updatedListing = await marketplaceService.updateListing(listingId, updateData, userId);

      res.status(200).json({
        success: true,
        message: 'Listing updated successfully',
        data: updatedListing,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel listing
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async cancelListing(req, res, next) {
    try {
      const { listingId } = req.params;
      const { userId } = req.user;

      const result = await marketplaceService.cancelListing(listingId, userId);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Purchase listing
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async purchaseListing(req, res, next) {
    try {
      const { listingId } = req.params;
      const { userId } = req.user;
      const { useEscrow = false } = req.body;

      const result = await marketplaceService.purchaseListing(listingId, userId, useEscrow);

      res.status(200).json({
        success: true,
        message: `Purchase ${useEscrow ? 'with escrow ' : ''}initiated successfully`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get marketplace statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getStats(req, res, next) {
    try {
      const stats = await marketplaceService.getMarketplaceStats();

      res.status(200).json({
        success: true,
        message: 'Marketplace statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get listing by token ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getListingByToken(req, res, next) {
    try {
      const { tokenId } = req.params;

      if (!tokenId || isNaN(tokenId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid token ID is required',
        });
      }

      const listing = await Listing.findOne({
        where: { tokenId: parseInt(tokenId) },
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
        return res.status(404).json({
          success: false,
          message: 'No active listing found for this token',
        });
      }

      const listingData = await marketplaceService.getListing(listing.listingId);

      res.status(200).json({
        success: true,
        message: 'Listing retrieved successfully',
        data: listingData,
      });
    } catch (error) {
      next(error);
    }
  }
}

const marketplaceController = new MarketplaceController();

export default marketplaceController;
