import rateLimit from 'express-rate-limit';
import config from '../config/index.js';

// Create rate limiter instance
// In development mode, allow unlimited requests
const limiter = (req, res, next) => {
  if (config.nodeEnv === 'development') {
    // Skip rate limiting in development
    return next();
  }
  
  // Use rate limiter in production
  return rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      const skipPaths = ['/health', '/api/health'];
      return skipPaths.some(path => req.path.startsWith(path));
    },
    handler: (req, res) => {
      console.warn(`🚫 Rate limit exceeded for IP: ${req.ip} on ${req.originalUrl}`);
      res.status(429).json({
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
      });
    },
  })(req, res, next);
};

export default limiter;

