import CarNFTABI from './abis/CarNFT.abi.json' assert { type: 'json' };
import MarketplaceABI from './abis/Marketplace.abi.json' assert { type: 'json' };
import EscrowABI from './abis/Escrow.abi.json' assert { type: 'json' };
import config from '../config/index.js';

// Contract addresses from deployment.json
const CONTRACT_ADDRESSES = {
  carNFT: config.contracts.carNFT || '0xEC7cb8C3EBE77BA6d284F13296bb1372A8522c5F',
  marketplace: config.contracts.marketplace || '0x5f246ADDCF057E0f778CD422e20e413be70f9a0c',
  escrow: config.contracts.escrow || '0x3C2BafebbB0c8c58f39A976e725cD20D611d01e9',
  verifierOracle: config.contracts.verifierOracle || '0xaD82Ecf79e232B0391C5479C7f632aA1EA701Ed1',
  trustedForwarder: config.contracts.trustedForwarder || '0x876939152C56362e17D508B9DEA77a3fDF9e4083',
};

// ABI exports
export const ABIS = {
  carNFT: CarNFTABI,
  marketplace: MarketplaceABI,
  escrow: EscrowABI,
};

// Contract addresses exports
export const ADDRESSES = CONTRACT_ADDRESSES;

// Helper function to get contract config
export const getContractConfig = (contractName) => {
  const address = CONTRACT_ADDRESSES[contractName];
  const abi = ABIS[contractName];
  
  if (!address || !abi) {
    throw new Error(`Contract ${contractName} not found in configuration`);
  }
  
  return { address, abi };
};

// Helper function to get all contract configs
export const getAllContractConfigs = () => {
  return {
    carNFT: getContractConfig('carNFT'),
    marketplace: getContractConfig('marketplace'),
    escrow: getContractConfig('escrow'),
  };
};

export default {
  ABIS,
  ADDRESSES,
  getContractConfig,
  getAllContractConfigs,
};
