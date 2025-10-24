import express from 'express';
import marketplaceController from './marketplace.controller.js';
import { authenticate, optionalAuth } from '../auth/auth.middleware.js';

const router = express.Router();

/**
 * @route POST /api/marketplace/listings
 * @desc Create new listing
 * @access Private
 */
router.post('/listings', authenticate, marketplaceController.createListing);

/**
 * @route GET /api/marketplace/listings
 * @desc Get active listings
 * @access Public
 */
router.get('/listings', optionalAuth, marketplaceController.getActiveListings);

/**
 * @route GET /api/marketplace/listings/:listingId
 * @desc Get listing details
 * @access Public
 */
router.get('/listings/:listingId', optionalAuth, marketplaceController.getListing);

/**
 * @route PUT /api/marketplace/listings/:listingId
 * @desc Update listing
 * @access Private (owner only)
 */
router.put('/listings/:listingId', authenticate, marketplaceController.updateListing);

/**
 * @route DELETE /api/marketplace/listings/:listingId
 * @desc Cancel listing
 * @access Private (owner only)
 */
router.delete('/listings/:listingId', authenticate, marketplaceController.cancelListing);

/**
 * @route POST /api/marketplace/listings/:listingId/purchase
 * @desc Purchase listing
 * @access Private
 */
router.post('/listings/:listingId/purchase', authenticate, marketplaceController.purchaseListing);

/**
 * @route GET /api/marketplace/listings/token/:tokenId
 * @desc Get listing by token ID
 * @access Public
 */
router.get('/listings/token/:tokenId', optionalAuth, marketplaceController.getListingByToken);

/**
 * @route GET /api/marketplace/my-listings
 * @desc Get current user's listings
 * @access Private
 */
router.get('/my-listings', authenticate, marketplaceController.getUserListings);

/**
 * @route GET /api/marketplace/stats
 * @desc Get marketplace statistics
 * @access Public
 */
router.get('/stats', optionalAuth, marketplaceController.getStats);

export default router;

