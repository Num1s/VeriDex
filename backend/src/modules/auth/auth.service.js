import { generateToken, verifyToken, createAuthMessage, generateNonce } from '../../utils/crypto.js';
import web3Service from '../../utils/web3.js';
import { User } from '../../database/models/index.js';

// Mock data for testing
const mockUsers = new Map();

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

      const normalizedAddress = walletAddress.toLowerCase();

      // First check if user exists in database
      let dbUser = await User.findOne({ where: { walletAddress: normalizedAddress } });
      
      // Find or create user in mock data
      let user = mockUsers.get(normalizedAddress);
      
      if (dbUser) {
        // User exists in DB, sync to mockUsers
        user = {
          id: dbUser.id,
          walletAddress: dbUser.walletAddress,
          email: dbUser.email,
          phone: dbUser.phone,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
          profileImage: dbUser.profileImage,
          kycStatus: dbUser.kycStatus,
          kycDocuments: dbUser.kycDocuments,
          isVerified: dbUser.isVerified,
          nonce: dbUser.nonce,
          lastLogin: dbUser.lastLogin,
          totalCars: dbUser.totalCars,
          totalListings: dbUser.totalListings,
          totalPurchases: dbUser.totalPurchases,
          reputationScore: dbUser.reputationScore,
          isBlocked: dbUser.isBlocked,
          blockedReason: dbUser.blockedReason,
          preferences: dbUser.preferences,
          createdAt: dbUser.createdAt,
          updatedAt: dbUser.updatedAt,
          deletedAt: dbUser.deletedAt,
        };
        mockUsers.set(normalizedAddress, user);
        console.log('User loaded from database:', user.id);
      } else if (!user) {
        // User doesn't exist anywhere, create new
        user = {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          walletAddress: normalizedAddress,
          email: null,
          phone: null,
          firstName: null,
          lastName: null,
          profileImage: null,
          kycStatus: 'not_submitted',
          kycDocuments: null,
          isVerified: false,
          nonce: null,
          lastLogin: null,
          totalCars: 0,
          totalListings: 0,
          totalPurchases: 0,
          reputationScore: 5.0,
          isBlocked: false,
          blockedReason: null,
          preferences: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        };
        mockUsers.set(normalizedAddress, user);

        // Save to database
        const savedUser = await User.create({
          id: user.id,
          walletAddress: user.walletAddress,
          email: user.email,
          nonce: user.nonce,
          isVerified: user.isVerified,
          kycStatus: user.kycStatus,
          lastLogin: user.lastLogin,
          totalCars: user.totalCars,
          totalListings: user.totalListings,
          totalPurchases: user.totalPurchases,
          reputationScore: user.reputationScore,
          isBlocked: user.isBlocked,
          blockedReason: user.blockedReason,
          preferences: user.preferences,
        });
        console.log('User created in database:', savedUser.id, 'wallet:', savedUser.walletAddress);
      }

      // Generate new nonce
      const nonce = generateNonce();
      user.nonce = nonce;
      user.updatedAt = new Date();

      // Update the user in the mock storage
      mockUsers.set(normalizedAddress, user);
      
      // Update in database
      await User.update({ nonce, updatedAt: new Date() }, { where: { walletAddress: normalizedAddress } });

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

      const normalizedAddress = walletAddress.toLowerCase();

      // Find user in mock data
      const user = mockUsers.get(normalizedAddress);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.nonce) {
        throw new Error('No nonce found. Please request authentication first.');
      }

      // For demo purposes, accept any signature as valid
      // In real implementation, you would verify the signature
      console.log('Mock signature verification - accepting any signature for demo');

      // Clear nonce after successful authentication
      user.nonce = null;
      user.lastLogin = new Date();
      user.updatedAt = new Date();

      // Update the user in the mock storage
      mockUsers.set(normalizedAddress, user);

      // Also save to database for persistence
      await User.upsert({
        id: user.id,
        walletAddress: user.walletAddress,
        email: user.email,
        nonce: user.nonce,
        isVerified: user.isVerified,
        kycStatus: user.kycStatus,
        lastLogin: user.lastLogin,
        totalCars: user.totalCars,
        totalListings: user.totalListings,
        totalPurchases: user.totalPurchases,
        reputationScore: user.reputationScore,
        isBlocked: user.isBlocked,
        blockedReason: user.blockedReason,
        preferences: user.preferences,
      });

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
      const user = Array.from(mockUsers.values()).find(u => u.id === decoded.userId);

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
      const user = Array.from(mockUsers.values()).find(u => u.id === userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Mock statistics
      const stats = {
        totalCars: user.totalCars || 0,
        totalListings: user.totalListings || 0,
        totalPurchases: user.totalPurchases || 0,
        reputationScore: user.reputationScore || 5.0,
      };

      return {
        id: user.id,
        walletAddress: user.walletAddress,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        kycStatus: user.kycStatus,
        isVerified: user.isVerified,
        totalCars: user.totalCars,
        totalListings: user.totalListings,
        totalPurchases: user.totalPurchases,
        reputationScore: user.reputationScore,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        fullName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null,
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
      let user = Array.from(mockUsers.values()).find(u => u.id === userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Update allowed fields
      const allowedFields = [
        'email', 'phone', 'firstName', 'lastName',
        'profileImage', 'preferences'
      ];

      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          user[field] = updateData[field];
        }
      });

      user.updatedAt = new Date();

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

      const user = Array.from(mockUsers.values()).find(u => u.id === decoded.userId);

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
      const user = Array.from(mockUsers.values()).find(u => u.id === userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Clear any sensitive data or perform cleanup
      user.nonce = null;
      user.updatedAt = new Date();

      return true;
    } catch (error) {
      console.error('Logout error:', error.message);
      throw error;
    }
  }
}

const authService = new AuthService();

export default authService;

