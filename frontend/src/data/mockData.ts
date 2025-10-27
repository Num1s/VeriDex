// Mock data for simulation
export interface MockCar {
  id: string;
  tokenId: number;
  make: string;
  model: string;
  year: number;
  vin: string;
  price: string;
  seller: string;
  buyer?: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  images: string[];
  mileage: number;
  color: string;
  fuelType: string;
  transmission: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockTransaction {
  id: string;
  type: 'purchase' | 'sale' | 'listing';
  carId: string;
  tokenId: number;
  price: string;
  buyer?: string;
  seller: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  gasUsed: string;
  gasPrice: string;
  transactionHash?: string;
  blockNumber?: number;
  timestamp: string;
  fees: {
    platformFee: string;
    gasFee: string;
    totalFee: string;
  };
}

export interface MockUser {
  id: string;
  address: string;
  name: string;
  avatar?: string;
  balance: string;
  totalPurchases: number;
  totalSales: number;
  reputation: number;
  verified: boolean;
  joinedAt: string;
}

// Mock cars data
export const mockCars: MockCar[] = [
  {
    id: '1',
    tokenId: 1,
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    vin: '1HGBH41JXMN109186',
    price: '2.5',
    seller: '0x1234567890123456789012345678901234567890',
    verificationStatus: 'verified',
    images: [
      'https://images.unsplash.com/photo-1549317336-206569e8475c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop'
    ],
    mileage: 25000,
    color: 'Silver',
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    condition: 'excellent',
    description: 'Well-maintained Toyota Camry with low mileage. Single owner, no accidents.',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    tokenId: 2,
    make: 'BMW',
    model: 'X5',
    year: 2019,
    vin: '5UXCR6C05L9A12345',
    price: '8.2',
    seller: '0x2345678901234567890123456789012345678901',
    verificationStatus: 'verified',
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop'
    ],
    mileage: 45000,
    color: 'Black',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    condition: 'good',
    description: 'Luxury SUV with premium features. Regular maintenance records available.',
    createdAt: '2024-01-20T14:15:00Z',
    updatedAt: '2024-01-20T14:15:00Z'
  },
  {
    id: '3',
    tokenId: 3,
    make: 'Tesla',
    model: 'Model 3',
    year: 2021,
    vin: '5YJ3E1EA4MF123456',
    price: '12.8',
    seller: '0x3456789012345678901234567890123456789012',
    verificationStatus: 'verified',
    images: [
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'
    ],
    mileage: 18000,
    color: 'White',
    fuelType: 'Electric',
    transmission: 'Automatic',
    condition: 'excellent',
    description: 'Tesla Model 3 with Autopilot. Supercharger network access included.',
    createdAt: '2024-01-25T09:45:00Z',
    updatedAt: '2024-01-25T09:45:00Z'
  },
  {
    id: '4',
    tokenId: 4,
    make: 'Honda',
    model: 'Civic',
    year: 2018,
    vin: '2HGFC2F59JH123456',
    price: '1.8',
    seller: '0x4567890123456789012345678901234567890123',
    verificationStatus: 'verified',
    images: [
      'https://images.unsplash.com/photo-1549317336-206569e8475c?w=800&h=600&fit=crop'
    ],
    mileage: 65000,
    color: 'Blue',
    fuelType: 'Gasoline',
    transmission: 'Manual',
    condition: 'good',
    description: 'Reliable Honda Civic with good fuel economy. Perfect for city driving.',
    createdAt: '2024-01-28T16:20:00Z',
    updatedAt: '2024-01-28T16:20:00Z'
  },
  {
    id: '5',
    tokenId: 5,
    make: 'Audi',
    model: 'A4',
    year: 2020,
    vin: 'WAUAF48H05K123456',
    price: '6.5',
    seller: '0x5678901234567890123456789012345678901234',
    verificationStatus: 'pending',
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop'
    ],
    mileage: 32000,
    color: 'Gray',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    condition: 'excellent',
    description: 'Audi A4 with premium interior. Quattro all-wheel drive.',
    createdAt: '2024-01-30T11:10:00Z',
    updatedAt: '2024-01-30T11:10:00Z'
  }
];

// Mock transactions data
export const mockTransactions: MockTransaction[] = [
  {
    id: 'tx1',
    type: 'purchase',
    carId: '1',
    tokenId: 1,
    price: '2.5',
    buyer: '0x9876543210987654321098765432109876543210',
    seller: '0x1234567890123456789012345678901234567890',
    status: 'completed',
    gasUsed: '0',
    gasPrice: '0',
    transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    blockNumber: 12345678,
    timestamp: '2024-01-16T15:30:00Z',
    fees: {
      platformFee: '0.05',
      gasFee: '0',
      totalFee: '0.05'
    }
  },
  {
    id: 'tx2',
    type: 'sale',
    carId: '2',
    tokenId: 2,
    price: '8.2',
    buyer: '0x1111111111111111111111111111111111111111',
    seller: '0x2345678901234567890123456789012345678901',
    status: 'completed',
    gasUsed: '0',
    gasPrice: '0',
    transactionHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
    blockNumber: 12345679,
    timestamp: '2024-01-21T10:15:00Z',
    fees: {
      platformFee: '0.164',
      gasFee: '0',
      totalFee: '0.164'
    }
  },
  {
    id: 'tx3',
    type: 'listing',
    carId: '3',
    tokenId: 3,
    price: '12.8',
    seller: '0x3456789012345678901234567890123456789012',
    status: 'completed',
    gasUsed: '0',
    gasPrice: '0',
    transactionHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
    blockNumber: 12345680,
    timestamp: '2024-01-25T09:45:00Z',
    fees: {
      platformFee: '0',
      gasFee: '0',
      totalFee: '0'
    }
  }
];

// Mock users data
export const mockUsers: MockUser[] = [
  {
    id: 'user1',
    address: '0x1234567890123456789012345678901234567890',
    name: 'Alice Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
    balance: '15.5',
    totalPurchases: 2,
    totalSales: 1,
    reputation: 95,
    verified: true,
    joinedAt: '2023-12-01T00:00:00Z'
  },
  {
    id: 'user2',
    address: '0x2345678901234567890123456789012345678901',
    name: 'Bob Smith',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    balance: '8.7',
    totalPurchases: 1,
    totalSales: 3,
    reputation: 88,
    verified: true,
    joinedAt: '2023-11-15T00:00:00Z'
  },
  {
    id: 'user3',
    address: '0x3456789012345678901234567890123456789012',
    name: 'Charlie Brown',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    balance: '25.2',
    totalPurchases: 0,
    totalSales: 2,
    reputation: 92,
    verified: true,
    joinedAt: '2023-10-20T00:00:00Z'
  }
];

// Mock marketplace stats
export const mockStats = {
  totalListings: 5,
  activeListings: 4,
  totalVolume: '31.8',
  sellThroughRate: 80,
  averagePrice: '6.36',
  totalUsers: 3,
  totalTransactions: 3
};

// Helper functions for simulation
export const simulatePurchase = (carId: string, buyerAddress: string): MockTransaction => {
  const car = mockCars.find(c => c.id === carId);
  if (!car) throw new Error('Car not found');

  const transaction: MockTransaction = {
    id: `tx_${Date.now()}`,
    type: 'purchase',
    carId: car.id,
    tokenId: car.tokenId,
    price: car.price,
    buyer: buyerAddress,
    seller: car.seller,
    status: 'completed',
    gasUsed: '0',
    gasPrice: '0',
    transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    blockNumber: Math.floor(Math.random() * 1000000) + 10000000,
    timestamp: new Date().toISOString(),
    fees: {
      platformFee: (parseFloat(car.price) * 0.02).toString(),
      gasFee: '0',
      totalFee: (parseFloat(car.price) * 0.02).toString()
    }
  };

  return transaction;
};

export const simulateSale = (carId: string, sellerAddress: string, price: string): MockTransaction => {
  const car = mockCars.find(c => c.id === carId);
  if (!car) throw new Error('Car not found');

  const transaction: MockTransaction = {
    id: `tx_${Date.now()}`,
    type: 'sale',
    carId: car.id,
    tokenId: car.tokenId,
    price: price,
    seller: sellerAddress,
    status: 'completed',
    gasUsed: '0',
    gasPrice: '0',
    transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    blockNumber: Math.floor(Math.random() * 1000000) + 10000000,
    timestamp: new Date().toISOString(),
    fees: {
      platformFee: (parseFloat(price) * 0.02).toString(),
      gasFee: '0',
      totalFee: (parseFloat(price) * 0.02).toString()
    }
  };

  return transaction;
};

export const simulateListing = (carId: string, sellerAddress: string, price: string): MockTransaction => {
  const car = mockCars.find(c => c.id === carId);
  if (!car) throw new Error('Car not found');

  const transaction: MockTransaction = {
    id: `tx_${Date.now()}`,
    type: 'listing',
    carId: car.id,
    tokenId: car.tokenId,
    price: price,
    seller: sellerAddress,
    status: 'completed',
    gasUsed: '0',
    gasPrice: '0',
    transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    blockNumber: Math.floor(Math.random() * 1000000) + 10000000,
    timestamp: new Date().toISOString(),
    fees: {
      platformFee: '0',
      gasFee: '0',
      totalFee: '0'
    }
  };

  return transaction;
};
