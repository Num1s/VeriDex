import gaslessService from './gasless.service.js';
import { authenticate } from '../auth/auth.middleware.js';
import relayerService from '../../config/relayer.config.js';
import web3Service from '../../utils/web3.js';

class GaslessController {
  /**
   * Mint car NFT gaslessly
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async mintCar(req, res, next) {
    try {
      const { userId } = req.user;
      const carData = req.body;
      const images = req.files; // From multer middleware

      const result = await gaslessService.mintCarGasless(carData, userId, images);

      res.status(201).json({
        success: true,
        message: 'Car mint transaction submitted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List car for sale gaslessly
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async listCar(req, res, next) {
    try {
      const { userId } = req.user;
      const { tokenId, price } = req.body;

      if (!tokenId || !price) {
        return res.status(400).json({
          success: false,
          message: 'Token ID and price are required',
        });
      }

      const result = await gaslessService.listCarGasless(tokenId, price, userId);

      res.status(201).json({
        success: true,
        message: 'Car listing transaction submitted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Purchase car gaslessly
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async purchaseCar(req, res, next) {
    try {
      const { userId } = req.user;
      const { listingId, price, useEscrow = false } = req.body;

      if (!listingId || !price) {
        return res.status(400).json({
          success: false,
          message: 'Listing ID and price are required',
        });
      }

      const result = await gaslessService.purchaseCarGasless(listingId, price, userId, useEscrow);

      res.status(201).json({
        success: true,
        message: `Car purchase transaction submitted successfully${useEscrow ? ' (with escrow)' : ''}`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get transaction status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getTransactionStatus(req, res, next) {
    try {
      const { txHash } = req.params;

      if (!txHash) {
        return res.status(400).json({
          success: false,
          message: 'Transaction hash is required',
        });
      }

      const transaction = await gaslessService.getTransactionStatus(txHash);

      res.status(200).json({
        success: true,
        message: 'Transaction status retrieved successfully',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's gasless transactions
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getUserTransactions(req, res, next) {
    try {
      const { userId } = req.user;
      const {
        type,
        status,
        limit = 20,
        offset = 0,
      } = req.query;

      const filters = {
        type,
        status,
        limit: parseInt(limit),
        offset: parseInt(offset),
      };

      const transactions = await gaslessService.getUserTransactions(userId, filters);

      res.status(200).json({
        success: true,
        message: 'User transactions retrieved successfully',
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel gasless transaction
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async cancelTransaction(req, res, next) {
    try {
      const { userId } = req.user;
      const { txHash } = req.body;

      if (!txHash) {
        return res.status(400).json({
          success: false,
          message: 'Transaction hash is required',
        });
      }

      const result = await gaslessService.cancelTransaction(txHash, userId);

      res.status(200).json({
        success: true,
        message: 'Transaction cancelled successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get gasless service statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getStats(req, res, next) {
    try {
      const stats = await gaslessService.getGaslessStats();

      res.status(200).json({
        success: true,
        message: 'Gasless statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get gas price estimate
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getGasPrice(req, res, next) {
    try {
      const gasPrice = await relayerService.getGasPrice();

      res.status(200).json({
        success: true,
        message: 'Gas price retrieved successfully',
        data: {
          gasPrice,
          gasPriceEth: web3Service.formatEther(gasPrice),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Estimate gas for transaction
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async estimateGas(req, res, next) {
    try {
      const { contractAddress, contractInterface, methodName, parameters } = req.body;

      if (!contractAddress || !contractInterface || !methodName || !parameters) {
        return res.status(400).json({
          success: false,
          message: 'Contract address, interface, method name, and parameters are required',
        });
      }

      const encodedData = web3Service.encodeFunctionCall(contractInterface, methodName, parameters);
      const gasEstimate = await relayerService.estimateGas(contractAddress, encodedData);

      res.status(200).json({
        success: true,
        message: 'Gas estimate retrieved successfully',
        data: {
          gasEstimate,
          gasEstimateEth: (gasEstimate * parseInt(await relayerService.getGasPrice()) / 1e18).toFixed(6),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

const gaslessController = new GaslessController();

export default gaslessController;
