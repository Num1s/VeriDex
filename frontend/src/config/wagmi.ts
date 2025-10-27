import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// Define Linea Sepolia with the CORRECT chain ID (59141 = 0xe705)
const lineaSepolia = {
  id: 59141,
  name: 'Linea Sepolia',
  nativeCurrency: { name: 'Linea Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia.linea.build'],
    },
    public: {
      http: ['https://rpc.sepolia.linea.build'],
    },
  },
  blockExplorers: {
    default: {
      name: 'LineaScan',
      url: 'https://sepolia.lineascan.build',
    },
  },
  testnet: true,
} as const;

// Create config once to avoid re-initialization
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '2c4f1e5c5e9c4a9c8e9c3e5f4a9c8e9c';

// Create config with singleton pattern to prevent multiple initializations
let configInstance: any = null;

export const getConfig = () => {
  if (!configInstance) {
    configInstance = getDefaultConfig({
      appName: 'AutoToken',
      projectId,
      chains: [lineaSepolia],
      ssr: true,
    });
  }
  return configInstance;
};

export const config = getConfig();
export const chains = [lineaSepolia];

