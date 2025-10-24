import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
  // Server Configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'autotoken',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  },

  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || '',
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  // Blockchain Configuration
  blockchain: {
    rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://sepolia.linea.build',
    privateKey: process.env.PRIVATE_KEY || '',
    chainId: parseInt(process.env.CHAIN_ID) || 59140,
    gasLimit: 8000000,
    gasPrice: 20000000000, // 20 gwei
  },

  // IPFS Configuration
  ipfs: {
    gateway: process.env.IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/',
    pinataApiKey: process.env.PINATA_API_KEY || '',
    pinataSecretKey: process.env.PINATA_SECRET_KEY || '',
  },

  // Gasless Configuration
  gasless: {
    trustedForwarder: process.env.TRUSTED_FORWARDER_ADDRESS || '',
    biconomyApiKey: process.env.BICONOMY_API_KEY || '',
  },

  // Status Network Configuration
  statusNetwork: {
    rpcUrl: process.env.STATUS_NETWORK_RPC || 'https://public.sepolia.status.network',
    apiKey: process.env.STATUS_API_KEY || '',
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    uploadDir: process.env.UPLOAD_DIR || 'uploads/',
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },

  // CORS Configuration
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },

  // Admin Configuration
  admin: {
    walletAddress: process.env.ADMIN_WALLET_ADDRESS || '',
  },

  // API Keys
  apis: {
    etherscan: process.env.ETHERSCAN_API_KEY || '',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },

  // Security
  security: {
    bcryptRounds: 12,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Contract Addresses (will be updated after deployment)
  contracts: {
    carNFT: process.env.CAR_NFT_ADDRESS || '',
    marketplace: process.env.MARKETPLACE_ADDRESS || '',
    escrow: process.env.ESCROW_ADDRESS || '',
    verifierOracle: process.env.VERIFIER_ORACLE_ADDRESS || '',
    trustedForwarder: process.env.TRUSTED_FORWARDER_ADDRESS || '',
  },
};

export default config;

