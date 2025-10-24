import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

import config from './config/index.js';
import { testConnection } from './config/db.config.js';
import ipfsService from './config/ipfs.config.js';
import relayerService from './config/relayer.config.js';

// Import route modules
import authRoutes from './modules/auth/auth.routes.js';
import carRoutes from './modules/cars/cars.routes.js';
import marketplaceRoutes from './modules/marketplace/marketplace.routes.js';
import gaslessRoutes from './modules/gasless/gasless.routes.js';

// Import middleware
import errorHandler from './utils/errorHandler.js';
import rateLimiter from './utils/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors(config.cors));

// Rate limiting
app.use(rateLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: config.version || '1.0.0',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/gasless', gaslessRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
  });
});

// Error handling middleware
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    console.log('🚀 Starting AutoToken Backend API...');
    console.log(`📍 Environment: ${config.nodeEnv}`);
    console.log(`🔗 Frontend URL: ${config.cors.origin}`);

    // Test database connection
    await testConnection();

    // Test IPFS connection
    console.log('🔗 Testing IPFS connection...');
    if (config.ipfs.pinataApiKey) {
      console.log('✅ IPFS service configured');
    } else {
      console.log('⚠️  IPFS service not configured - image uploads will be disabled');
    }

    // Test relayer service
    console.log('🔗 Testing blockchain connection...');
    const balance = await relayerService.getBalance();
    console.log(`✅ Relayer balance: ${balance} ETH`);
    console.log(`📍 Relayer address: ${relayerService.getAddress()}`);

    // Start server
    const server = app.listen(config.port, () => {
      console.log(`\n🎉 AutoToken Backend API running on port ${config.port}`);
      console.log(`📊 Health check: http://localhost:${config.port}/health`);
      console.log(`📚 API Documentation: http://localhost:${config.port}/api`);
      console.log('\n🔧 Available endpoints:');
      console.log('  POST /api/auth/nonce - Generate authentication nonce');
      console.log('  POST /api/auth/login - Wallet authentication');
      console.log('  GET  /api/auth/profile - Get user profile');
      console.log('  POST /api/cars - Mint new car NFT');
      console.log('  GET  /api/cars/my - Get user cars');
      console.log('  GET  /api/marketplace/listings - Get active listings');
      console.log('  POST /api/marketplace/listings - Create listing');
      console.log('  POST /api/gasless/mint - Mint car gaslessly');
      console.log('  POST /api/gasless/list - List car gaslessly');
      console.log('  GET  /api/gasless/transactions - Get gasless transactions');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('\n🛑 SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\n🛑 SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();
