import rateLimit from 'express-rate-limit';
import config from '../config/index.js';

// Create rate limiter instance
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 15 minutes
  max: config.rateLimit.max, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for successful requests in development
  skip: (req, res) => {
    return config.nodeEnv === 'development' && res.statusCode < 400;
  },
  // Custom key generator (use IP address)
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  // Handler for when limit is exceeded
  handler: (req, res) => {
    console.warn(`🚫 Rate limit exceeded for IP: ${req.ip} on ${req.originalUrl}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
    });
  },
  // Skip rate limiting for certain paths
  skip: (req) => {
    const skipPaths = ['/health', '/api/health'];
    return skipPaths.some(path => req.path.startsWith(path));
  },
});

export default limiter;

