import { jest } from '@jest/globals';
import authService from '../auth.service.js';
import { User } from '../../../database/models/index.js';

// Mock the User model
jest.mock('../../../database/models/index.js', () => ({
  User: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateNonce', () => {
    it('should generate nonce for new user', async () => {
      const mockUser = {
        id: '123',
        walletAddress: '0x1234567890123456789012345678901234567890',
        nonce: null,
        save: jest.fn(),
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);

      const result = await authService.generateNonce('0x1234567890123456789012345678901234567890');

      expect(User.findOne).toHaveBeenCalledWith({
        where: { walletAddress: '0x1234567890123456789012345678901234567890' }
      });
      expect(User.create).toHaveBeenCalledWith({
        walletAddress: '0x1234567890123456789012345678901234567890',
      });
      expect(mockUser.save).toHaveBeenCalled();
      expect(result.nonce).toBeDefined();
      expect(result.user.nonce).toBeDefined();
    });

    it('should generate nonce for existing user', async () => {
      const mockUser = {
        id: '123',
        walletAddress: '0x1234567890123456789012345678901234567890',
        nonce: 'old_nonce',
        save: jest.fn(),
      };

      User.findOne.mockResolvedValue(mockUser);

      const result = await authService.generateNonce('0x1234567890123456789012345678901234567890');

      expect(mockUser.save).toHaveBeenCalled();
      expect(mockUser.nonce).not.toBe('old_nonce');
      expect(result.nonce).toBeDefined();
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', async () => {
      const mockUser = {
        id: '123',
        walletAddress: '0x1234567890123456789012345678901234567890',
        isVerified: true,
        kycStatus: 'approved',
        isBlocked: false,
      };

      User.findByPk.mockResolvedValue(mockUser);

      const decoded = await authService.verifyToken('valid_token');

      expect(User.findByPk).toHaveBeenCalledWith('123');
      expect(decoded.userId).toBe('123');
      expect(decoded.walletAddress).toBe('0x1234567890123456789012345678901234567890');
    });

    it('should reject token for blocked user', async () => {
      const mockUser = {
        id: '123',
        walletAddress: '0x1234567890123456789012345678901234567890',
        isBlocked: true,
      };

      User.findByPk.mockResolvedValue(mockUser);

      await expect(authService.verifyToken('valid_token')).rejects.toThrow('Account is blocked');
    });

    it('should reject token for non-existent user', async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(authService.verifyToken('valid_token')).rejects.toThrow('User not found');
    });
  });
});

