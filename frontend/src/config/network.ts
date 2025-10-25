import { mainnet, sepolia, hardhat } from 'wagmi/chains';

// Network configurations
export const NETWORKS = {
  mainnet: {
    ...mainnet,
    name: 'Ethereum Mainnet',
    blockExplorer: 'https://etherscan.io',
    rpcUrls: {
      default: {
        http: ['https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_ID}'],
      },
    },
  },
  sepolia: {
    ...sepolia,
    name: 'Ethereum Sepolia',
    blockExplorer: 'https://sepolia.etherscan.io',
    rpcUrls: {
      default: {
        http: ['https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_ID}'],
      },
    },
  },
  linea: {
    id: 59140,
    name: 'Linea Testnet',
    network: 'linea-testnet',
    nativeCurrency: {
      decimals: 18,
      name: 'Linea Ether',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: {
        http: [
          'https://linea-sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
          'https://linea-sepolia.blockpi.network/v1/rpc/public',
          'https://rpc.sepolia.linea.build'
        ],
      },
      public: {
        http: [
          'https://linea-sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
          'https://linea-sepolia.blockpi.network/v1/rpc/public',
          'https://rpc.sepolia.linea.build'
        ],
      },
    },
    blockExplorers: {
      default: {
        name: 'LineaScan',
        url: 'https://sepolia.lineascan.build',
      },
    },
    testnet: true,
  },
  status: {
    id: 1946,
    name: 'Status Network',
    network: 'status-network',
    nativeCurrency: {
      decimals: 18,
      name: 'Status Ether',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: {
        http: ['https://public.sepolia.status.network'],
      },
      public: {
        http: ['https://public.sepolia.status.network'],
      },
    },
    blockExplorers: {
      default: {
        name: 'Status Explorer',
        url: 'https://public.sepolia.status.network',
      },
    },
    testnet: true,
  },
  hardhat: {
    ...hardhat,
    name: 'Hardhat Local',
    blockExplorer: 'http://10.208.0.158:8545',
  },
};

// Supported chains
export const SUPPORTED_CHAINS = [
  NETWORKS.mainnet,
  NETWORKS.sepolia,
  NETWORKS.linea,
  NETWORKS.status,
  NETWORKS.hardhat,
];

// Default chain (can be configured via environment)
export const DEFAULT_CHAIN = NETWORKS.linea; // Use Linea testnet for development

// Gasless configuration
export const GASLESS_CONFIG = {
  // Trusted forwarder addresses
  trustedForwarders: {
    31337: '0x876939152C56362e17D508B9DEA77a3fDF9e4083', // Hardhat - GaslessMetaTx
    59140: '0x0000000000000000000000000000000000000000', // Linea (to be updated)
    1946: '0x0000000000000000000000000000000000000000', // Status (to be updated)
  },

  // Relayer service URLs
  relayerUrls: {
    31337: 'http://10.208.0.158:3001/api/gasless',
    59140: 'https://api.autotoken.com/api/gasless',
    1946: 'https://api.autotoken.com/api/gasless',
  },

  // Meta-transaction domain
  domain: {
    name: 'AutoToken',
    version: '1',
    chainId: DEFAULT_CHAIN.id,
    verifyingContract: '0x0000000000000000000000000000000000000000',
  },
};

// API configuration
export const API_CONFIG = {
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://10.208.0.158:3001/api',
  timeout: 180000, // 180 seconds (3 minutes) for blockchain operations
  retries: 3,
};

// IPFS configuration
export const IPFS_CONFIG = {
  gateway: 'https://gateway.pinata.cloud/ipfs/',
  uploadEndpoint: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
};

