import express from 'express';
import authController from './auth.controller.js';
import { authenticate, optionalAuth } from './auth.middleware.js';

const router = express.Router();

/**
 * @route POST /api/auth/nonce
 * @desc Generate nonce for wallet authentication
 * @access Public
 */
router.post('/nonce', authController.generateNonce);

/**
 * @route POST /api/auth/login
 * @desc Authenticate with wallet signature
 * @access Public
 */
router.post('/login', authController.authenticate);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh authentication token
 * @access Public
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route GET /api/auth/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @route PUT /api/auth/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile', authenticate, authController.updateProfile);

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route GET /api/auth/verify
 * @desc Verify token validity
 * @access Private
 */
router.get('/verify', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    data: req.user,
  });
});

export default router;

