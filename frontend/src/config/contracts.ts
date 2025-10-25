import { Address } from 'viem';

// Contract addresses (will be updated after deployment)
export const CONTRACT_ADDRESSES = {
  // Mainnet
  1: {
    carNFT: '0x0000000000000000000000000000000000000000' as Address,
    marketplace: '0x0000000000000000000000000000000000000000' as Address,
    escrow: '0x0000000000000000000000000000000000000000' as Address,
    verifierOracle: '0x0000000000000000000000000000000000000000' as Address,
    trustedForwarder: '0x0000000000000000000000000000000000000000' as Address,
  },
  // Sepolia
  11155111: {
    carNFT: '0x02e8910B3B89690d4aeC9fcC0Ae2cD16fB6A4828' as Address,
    marketplace: '0x9abb5861e3a1eDF19C51F8Ac74A81782e94F8FdC' as Address,
    escrow: '0x564Db7a11653228164FD03BcA60465270E67b3d7' as Address,
    verifierOracle: '0x484242986F57dFcA98EeC2C78427931C63F1C4ce' as Address,
    trustedForwarder: '0x084815D1330eCC3eF94193a19Ec222C0C73dFf2d' as Address,
  },
  // Linea Testnet
  59140: {
    carNFT: '0x0000000000000000000000000000000000000000' as Address,
    marketplace: '0x0000000000000000000000000000000000000000' as Address,
    escrow: '0x0000000000000000000000000000000000000000' as Address,
    verifierOracle: '0x0000000000000000000000000000000000000000' as Address,
    trustedForwarder: '0x0000000000000000000000000000000000000000' as Address,
  },
  // Status Network
  1946: {
    carNFT: '0x0000000000000000000000000000000000000000' as Address,
    marketplace: '0x0000000000000000000000000000000000000000' as Address,
    escrow: '0x0000000000000000000000000000000000000000' as Address,
    verifierOracle: '0x0000000000000000000000000000000000000000' as Address,
    trustedForwarder: '0x0000000000000000000000000000000000000000' as Address,
  },
  // Hardhat Local
  31337: {
    carNFT: '0xEC7cb8C3EBE77BA6d284F13296bb1372A8522c5F' as Address,
    marketplace: '0x5f246ADDCF057E0f778CD422e20e413be70f9a0c' as Address,
    escrow: '0x3C2BafebbB0c8c58f39A976e725cD20D611d01e9' as Address,
    verifierOracle: '0xaD82Ecf79e232B0391C5479C7f632aA1EA701Ed1' as Address,
    trustedForwarder: '0x876939152C56362e17D508B9DEA77a3fDF9e4083' as Address,
  },
};

// Contract ABIs (simplified versions for frontend)
export const CAR_NFT_ABI = [
  // Mint function
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'vin', type: 'string' },
      { name: 'make', type: 'string' },
      { name: 'model', type: 'string' },
      { name: 'year', type: 'uint16' },
      { name: 'metadataURI', type: 'string' },
    ],
    name: 'mintCar',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Verify function
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'verifyCar',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Get car details
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getCarDetails',
    outputs: [
      { name: 'vin', type: 'string' },
      { name: 'make', type: 'string' },
      { name: 'model', type: 'string' },
      { name: 'year', type: 'uint16' },
      { name: 'color', type: 'string' },
      { name: 'verified', type: 'bool' },
      { name: 'owner', type: 'address' },
      { name: 'metadataURI', type: 'string' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // Transfer function
  {
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Owner of
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Token URI
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export const MARKETPLACE_ABI = [
  // Create listing
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'price', type: 'uint256' },
    ],
    name: 'createListing',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Purchase listing
  {
    inputs: [{ name: 'listingId', type: 'uint256' }],
    name: 'purchaseListing',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  // Get listing
  {
    inputs: [{ name: 'listingId', type: 'uint256' }],
    name: 'getListing',
    outputs: [
      { name: 'listingId', type: 'uint256' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'seller', type: 'address' },
      { name: 'price', type: 'uint256' },
      { name: 'active', type: 'bool' },
      { name: 'createdAt', type: 'uint256' },
      { name: 'description', type: 'string' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

export const ESCROW_ABI = [
  // Release escrow
  {
    inputs: [{ name: 'dealId', type: 'uint256' }],
    name: 'releaseEscrow',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Get escrow deal
  {
    inputs: [{ name: 'dealId', type: 'uint256' }],
    name: 'getEscrowDeal',
    outputs: [
      { name: 'dealId', type: 'uint256' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'seller', type: 'address' },
      { name: 'buyer', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'state', type: 'uint8' },
      { name: 'createdAt', type: 'uint256' },
      { name: 'releasedAt', type: 'uint256' },
      { name: 'notes', type: 'string' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

export const VERIFIER_ORACLE_ABI = [
  // Complete verification
  {
    inputs: [
      { name: 'requestId', type: 'uint256' },
      { name: 'status', type: 'uint8' },
      { name: 'notes', type: 'string' },
    ],
    name: 'completeVerification',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Request verification
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'documents', type: 'string' },
    ],
    name: 'requestVerification',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
];

// Helper function to get contract addresses for current chain
export const getContractAddresses = (chainId: number) => {
  return (CONTRACT_ADDRESSES as any)[chainId] || (CONTRACT_ADDRESSES as any)[31337]; // Default to hardhat
};

// Helper function to get contract address
export const getContractAddress = (contractName: string, chainId: number): Address => {
  const addresses = getContractAddresses(chainId);
  return addresses[contractName];
};

// Helper function to get ABI
export const getContractABI = (contractName: string) => {
  switch (contractName) {
    case 'carNFT':
      return CAR_NFT_ABI;
    case 'marketplace':
      return MARKETPLACE_ABI;
    case 'escrow':
      return ESCROW_ABI;
    case 'verifierOracle':
      return VERIFIER_ORACLE_ABI;
    default:
      return [];
  }
};

