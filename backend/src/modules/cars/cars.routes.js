import express from 'express';
import multer from 'multer';
import carsController from './cars.controller.js';
import { authenticate, optionalAuth } from '../auth/auth.middleware.js';
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
 * @route POST /api/cars
 * @desc Create new car NFT
 * @access Private
 */
router.post('/', authenticate, upload.array('images', 10), carsController.createCar);

/**
 * @route GET /api/cars/my
 * @desc Get current user's cars
 * @access Private
 */
router.get('/my', authenticate, carsController.getUserCars);

/**
 * @route GET /api/cars/search
 * @desc Search cars
 * @access Public
 */
router.get('/search', optionalAuth, carsController.searchCars);

/**
 * @route GET /api/cars/stats
 * @desc Get car statistics
 * @access Public
 */
router.get('/stats', optionalAuth, carsController.getCarStats);

/**
 * @route GET /api/cars/token/:tokenId
 * @desc Get car by token ID
 * @access Public
 */
router.get('/token/:tokenId', optionalAuth, carsController.getCarByTokenId);

/**
 * @route GET /api/cars/vin/:vin
 * @desc Get car by VIN
 * @access Public
 */
router.get('/vin/:vin', optionalAuth, carsController.getCarByVin);

/**
 * @route GET /api/cars/:id
 * @desc Get car details
 * @access Private (owner only)
 */
router.get('/:id', authenticate, carsController.getCar);

/**
 * @route PUT /api/cars/:id
 * @desc Update car details
 * @access Private (owner only)
 */
router.put('/:id', authenticate, carsController.updateCar);

/**
 * @route POST /api/cars/upload
 * @desc Upload car images
 * @access Private
 */
router.post('/upload', authenticate, upload.array('images', 10), carsController.uploadImages);

export default router;

