import { User } from '../../database/models/index.js';
import { generateToken, verifyToken, createAuthMessage, generateNonce } from '../../utils/crypto.js';
import web3Service from '../../utils/web3.js';

class AuthService {
  /**
   * Generate nonce for wallet authentication
   * @param {string} walletAddress - User's wallet address
   * @returns {Promise<Object>} - Nonce and user data
   */
  async generateNonce(walletAddress) {
    try {
      if (!web3Service.isValidAddress(walletAddress)) {
        throw new Error('Invalid wallet address');
      }

      // Find or create user
      let user = await User.findOne({
        where: { walletAddress: walletAddress.toLowerCase() }
      });

      if (!user) {
        user = await User.create({
          walletAddress: walletAddress.toLowerCase(),
        });
      }

      // Generate new nonce
      const nonce = generateNonce();
      user.nonce = nonce;
      await user.save();

      return {
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          nonce: user.nonce,
        },
        nonce,
      };
    } catch (error) {
      console.error('Generate nonce error:', error.message);
      throw error;
    }
  }

  /**
   * Authenticate user with wallet signature
   * @param {string} walletAddress - User's wallet address
   * @param {string} signature - Signature of the auth message
   * @param {string} message - Original message that was signed
   * @returns {Promise<Object>} - JWT token and user data
   */
  async authenticateWithSignature(walletAddress, signature, message) {
    try {
      if (!web3Service.isValidAddress(walletAddress)) {
        throw new Error('Invalid wallet address');
      }

      // Find user
      const user = await User.findOne({
        where: { walletAddress: walletAddress.toLowerCase() }
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.nonce) {
        throw new Error('No nonce found. Please request authentication first.');
      }

      // Verify signature
      const isValidSignature = web3Service.verifySignature(message, signature, walletAddress);

      if (!isValidSignature) {
        throw new Error('Invalid signature');
      }

      // Clear nonce after successful authentication
      user.nonce = null;
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        walletAddress: user.walletAddress,
        isVerified: user.isVerified,
        kycStatus: user.kycStatus,
      });

      return {
        token,
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isVerified: user.isVerified,
          kycStatus: user.kycStatus,
          reputationScore: user.reputationScore,
        },
      };
    } catch (error) {
      console.error('Authentication error:', error.message);
      throw error;
    }
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Decoded token payload
   */
  async verifyToken(token) {
    try {
      const decoded = verifyToken(token);

      // Check if user still exists and is not blocked
      const user = await User.findByPk(decoded.userId);

      if (!user) {
        throw new Error('User not found');
      }

      if (user.isBlocked) {
        throw new Error('Account is blocked');
      }

      return {
        userId: user.id,
        walletAddress: user.walletAddress,
        isVerified: user.isVerified,
        kycStatus: user.kycStatus,
      };
    } catch (error) {
      console.error('Token verification error:', error.message);
      throw error;
    }
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User profile data
   */
  async getUserProfile(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: {
          exclude: ['nonce', 'kycDocuments', 'deletedAt'],
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get user's statistics
      const stats = await user.updateStats();

      return {
        ...user.toJSON(),
        fullName: user.getFullName(),
        stats,
      };
    } catch (error) {
      console.error('Get user profile error:', error.message);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated user data
   */
  async updateUserProfile(userId, updateData) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Update allowed fields
      const allowedFields = [
        'email', 'phone', 'firstName', 'lastName',
        'profileImage', 'preferences'
      ];

      const updatePayload = {};
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          updatePayload[field] = updateData[field];
        }
      });

      await user.update(updatePayload);

      return {
        id: user.id,
        walletAddress: user.walletAddress,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        preferences: user.preferences,
        isVerified: user.isVerified,
        kycStatus: user.kycStatus,
        reputationScore: user.reputationScore,
      };
    } catch (error) {
      console.error('Update user profile error:', error.message);
      throw error;
    }
  }

  /**
   * Refresh authentication token
   * @param {string} token - Current JWT token
   * @returns {Promise<Object>} - New token and user data
   */
  async refreshToken(token) {
    try {
      const decoded = await this.verifyToken(token);

      const user = await User.findByPk(decoded.userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Generate new token
      const newToken = generateToken({
        userId: user.id,
        walletAddress: user.walletAddress,
        isVerified: user.isVerified,
        kycStatus: user.kycStatus,
      });

      return {
        token: newToken,
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isVerified: user.isVerified,
          kycStatus: user.kycStatus,
          reputationScore: user.reputationScore,
        },
      };
    } catch (error) {
      console.error('Refresh token error:', error.message);
      throw error;
    }
  }

  /**
   * Logout user (invalidate token)
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - Success status
   */
  async logout(userId) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Clear any sensitive data or perform cleanup
      user.nonce = null;
      await user.save();

      return true;
    } catch (error) {
      console.error('Logout error:', error.message);
      throw error;
    }
  }
}

const authService = new AuthService();

export default authService;
