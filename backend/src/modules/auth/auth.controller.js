import authService from './auth.service.js';
import { createAuthMessage } from '../../utils/crypto.js';

class AuthController {
  /**
   * Generate nonce for wallet authentication
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async generateNonce(req, res, next) {
    try {
      const { walletAddress } = req.body;

      if (!walletAddress) {
        return res.status(400).json({
          success: false,
          message: 'Wallet address is required',
        });
      }

      const result = await authService.generateNonce(walletAddress);

      res.status(200).json({
        success: true,
        message: 'Nonce generated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Authenticate user with wallet signature
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async authenticate(req, res, next) {
    try {
      const { walletAddress, signature, message } = req.body;

      if (!walletAddress || !signature || !message) {
        return res.status(400).json({
          success: false,
          message: 'Wallet address, signature, and message are required',
        });
      }

      const result = await authService.authenticateWithSignature(walletAddress, signature, message);

      res.status(200).json({
        success: true,
        message: 'Authentication successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getProfile(req, res, next) {
    try {
      const { userId } = req.user;

      const profile = await authService.getUserProfile(userId);

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async updateProfile(req, res, next) {
    try {
      const { userId } = req.user;
      const updateData = req.body;

      const updatedProfile = await authService.updateUserProfile(userId, updateData);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh authentication token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async refreshToken(req, res, next) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token is required',
        });
      }

      const result = await authService.refreshToken(token);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async logout(req, res, next) {
    try {
      const { userId } = req.user;

      await authService.logout(userId);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify JWT token (middleware helper)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async verifyToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Access token is required',
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      const decoded = await authService.verifyToken(token);

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
  }
}

const authController = new AuthController();

export default authController;

