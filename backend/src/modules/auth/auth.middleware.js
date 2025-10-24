import authService from './auth.service.js';

/**
 * Authentication middleware - verifies JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const authenticate = async (req, res, next) => {
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
};

/**
 * Optional authentication middleware - doesn't require token but adds user if present
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = await authService.verifyToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // For optional auth, just continue without user
    next();
  }
};

/**
 * Admin only middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const requireAdmin = async (req, res, next) => {
  try {
    await authenticate(req, res, async () => {
      // Check if user is admin (this would typically check against admin wallet addresses)
      const adminWallets = process.env.ADMIN_WALLETS?.split(',') || [];

      if (!adminWallets.includes(req.user.walletAddress.toLowerCase())) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required',
        });
      }

      next();
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }
};

/**
 * Verifier role middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const requireVerifier = async (req, res, next) => {
  try {
    await authenticate(req, res, async () => {
      // Check if user has verifier role (would check KYC status or role assignment)
      if (!req.user.isVerified || req.user.kycStatus !== 'approved') {
        return res.status(403).json({
          success: false,
          message: 'Verifier access required',
        });
      }

      next();
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }
};

/**
 * Wallet ownership middleware - ensures user owns the resource
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const requireOwnership = (resourceField = 'ownerAddress') => {
  return async (req, res, next) => {
    try {
      await authenticate(req, res, async () => {
        const resourceUser = req[resourceField];

        if (!resourceUser || req.user.walletAddress.toLowerCase() !== resourceUser.toLowerCase()) {
          return res.status(403).json({
            success: false,
            message: 'Resource ownership required',
          });
        }

        next();
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }
  };
};
