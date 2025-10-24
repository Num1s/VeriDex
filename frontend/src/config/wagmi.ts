import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, hardhat } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'AutoToken',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'demo-project-id',
  chains: [mainnet, sepolia, hardhat],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

export const chains = [mainnet, sepolia, hardhat];

