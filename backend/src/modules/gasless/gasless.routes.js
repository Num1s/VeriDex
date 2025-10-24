import express from 'express';
import multer from 'multer';
import gaslessController from './gasless.controller.js';
import { authenticate } from '../auth/auth.middleware.js';
import config from '../../config/index.js';

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 10, // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    if (config.upload.allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
  },
});

const router = express.Router();

/**
 * @route POST /api/gasless/mint
 * @desc Mint car NFT gaslessly
 * @access Private
 */
router.post('/mint', authenticate, upload.array('images', 10), gaslessController.mintCar);

/**
 * @route POST /api/gasless/list
 * @desc List car for sale gaslessly
 * @access Private
 */
router.post('/list', authenticate, gaslessController.listCar);

/**
 * @route POST /api/gasless/purchase
 * @desc Purchase car gaslessly
 * @access Private
 */
router.post('/purchase', authenticate, gaslessController.purchaseCar);

/**
 * @route GET /api/gasless/transactions
 * @desc Get user's gasless transactions
 * @access Private
 */
router.get('/transactions', authenticate, gaslessController.getUserTransactions);

/**
 * @route GET /api/gasless/transactions/:txHash
 * @desc Get transaction status
 * @access Private
 */
router.get('/transactions/:txHash', authenticate, gaslessController.getTransactionStatus);

/**
 * @route DELETE /api/gasless/transactions/:txHash
 * @desc Cancel gasless transaction
 * @access Private
 */
router.delete('/transactions/:txHash', authenticate, gaslessController.cancelTransaction);

/**
 * @route GET /api/gasless/stats
 * @desc Get gasless service statistics
 * @access Private
 */
router.get('/stats', authenticate, gaslessController.getStats);

/**
 * @route GET /api/gasless/gas-price
 * @desc Get current gas price
 * @access Public
 */
router.get('/gas-price', gaslessController.getGasPrice);

/**
 * @route POST /api/gasless/estimate-gas
 * @desc Estimate gas for transaction
 * @access Public
 */
router.post('/estimate-gas', gaslessController.estimateGas);

export default router;

