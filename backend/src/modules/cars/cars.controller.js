import carsService from './cars.service.js';
import { authenticate, requireOwnership } from '../auth/auth.middleware.js';
import { Car } from '../../database/models/index.js';
import ipfsService from '../../config/ipfs.config.js';
import { validateAndFormatVIN } from '../../utils/validators.js';

class CarsController {
  /**
   * Create new car
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async createCar(req, res, next) {
    try {
      const { userId } = req.user;
      const carData = req.body;
      const images = req.files; // From multer middleware

      const result = await carsService.createCar(carData, userId, images);

      res.status(201).json({
        success: true,
        message: 'Car created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get car details
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getCar(req, res, next) {
    try {
      const { id } = req.params;
      const { userId } = req.user; // Optional for public cars

      const car = await carsService.getCar(id, userId);

      res.status(200).json({
        success: true,
        message: 'Car retrieved successfully',
        data: car,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's cars
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getUserCars(req, res, next) {
    try {
      const { userId } = req.user;
      const {
        verificationStatus,
        isListed,
        limit = 20,
        offset = 0,
      } = req.query;

      const filters = {
        verificationStatus,
        isListed: isListed ? isListed === 'true' : undefined,
        limit: parseInt(limit),
        offset: parseInt(offset),
      };

      const cars = await carsService.getUserCars(userId, filters);

      res.status(200).json({
        success: true,
        message: 'User cars retrieved successfully',
        data: cars,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update car
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async updateCar(req, res, next) {
    try {
      const { id } = req.params;
      const { userId } = req.user;
      const updateData = req.body;

      const updatedCar = await carsService.updateCar(id, updateData, userId);

      res.status(200).json({
        success: true,
        message: 'Car updated successfully',
        data: updatedCar,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search cars
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async searchCars(req, res, next) {
    try {
      const {
        make,
        model,
        year,
        minPrice,
        maxPrice,
        verificationStatus,
        isListed,
        limit = 20,
        offset = 0,
      } = req.query;

      const searchParams = {
        make,
        model,
        year: year ? parseInt(year) : undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        verificationStatus,
        isListed: isListed ? isListed === 'true' : undefined,
        limit: parseInt(limit),
        offset: parseInt(offset),
      };

      const cars = await carsService.searchCars(searchParams);

      res.status(200).json({
        success: true,
        message: 'Cars search completed successfully',
        data: cars,
        filters: searchParams,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get car statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getCarStats(req, res, next) {
    try {
      const stats = await carsService.getCarStats();

      res.status(200).json({
        success: true,
        message: 'Car statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload car images
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async uploadImages(req, res, next) {
    try {
      const images = req.files;

      if (!images || images.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No images provided',
        });
      }

      const uploadedImages = [];

      for (const image of images) {
        if (image.buffer) {
          const hash = await ipfsService.uploadFile(image.buffer, image.originalname);
          uploadedImages.push({
            url: ipfsService.getUrl(hash),
            hash,
            filename: image.originalname,
            size: image.size,
          });
        }
      }

      res.status(200).json({
        success: true,
        message: 'Images uploaded successfully',
        data: uploadedImages,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get car by token ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getCarByTokenId(req, res, next) {
    try {
      const { tokenId } = req.params;

      if (!tokenId || isNaN(tokenId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid token ID is required',
        });
      }

      const car = await Car.findOne({
        where: { tokenId: parseInt(tokenId) },
      });

      if (!car) {
        return res.status(404).json({
          success: false,
          message: 'Car not found',
        });
      }

      const carData = await carsService.getCar(car.id);

      res.status(200).json({
        success: true,
        message: 'Car retrieved successfully',
        data: carData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get car by VIN
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getCarByVin(req, res, next) {
    try {
      const { vin } = req.params;

      if (!vin) {
        return res.status(400).json({
          success: false,
          message: 'VIN is required',
        });
      }

      const validation = validateAndFormatVIN(vin);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.error,
        });
      }

      const car = await Car.findOne({
        where: { vin: validation.formatted },
      });

      if (!car) {
        return res.status(404).json({
          success: false,
          message: 'Car not found',
        });
      }

      const carData = await carsService.getCar(car.id);

      res.status(200).json({
        success: true,
        message: 'Car retrieved successfully',
        data: carData,
      });
    } catch (error) {
      next(error);
    }
  }
}

const carsController = new CarsController();

export default carsController;
