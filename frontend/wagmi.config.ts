import { defineConfig } from '@wagmi/core';
import { mainnet, sepolia, hardhat } from 'wagmi/chains';

export const config = defineConfig({
  chains: [mainnet, sepolia, hardhat],
  transports: {
    [mainnet.id]: {
      webSocket: `wss://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
    },
    [sepolia.id]: {
      webSocket: `wss://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
    },
    [hardhat.id]: {
      webSocket: 'ws://localhost:8545',
    },
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}

