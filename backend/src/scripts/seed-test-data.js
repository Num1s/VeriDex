import { User, Car } from '../database/models/index.js';

// Test users with their wallet addresses
const testUsers = [
  {
    id: 'user_test_alice',
    walletAddress: '0x1234567890123456789012345678901234567890',
    email: 'alice@test.com',
    firstName: 'Alice',
    lastName: 'Johnson',
    isVerified: true,
    kycStatus: 'approved',
    totalCars: 0,
    totalListings: 0,
    totalPurchases: 0,
    reputationScore: 4.8,
  },
  {
    id: 'user_test_bob',
    walletAddress: '0x2345678901234567890123456789012345678901',
    email: 'bob@test.com',
    firstName: 'Bob',
    lastName: 'Smith',
    isVerified: true,
    kycStatus: 'approved',
    totalCars: 0,
    totalListings: 0,
    totalPurchases: 0,
    reputationScore: 4.5,
  },
  {
    id: 'user_test_charlie',
    walletAddress: '0x3456789012345678901234567890123456789012',
    email: 'charlie@test.com',
    firstName: 'Charlie',
    lastName: 'Brown',
    isVerified: true,
    kycStatus: 'approved',
    totalCars: 0,
    totalListings: 0,
    totalPurchases: 0,
    reputationScore: 4.9,
  },
  {
    id: 'user_test_diana',
    walletAddress: '0x4567890123456789012345678901234567890123',
    email: 'diana@test.com',
    firstName: 'Diana',
    lastName: 'Martinez',
    isVerified: true,
    kycStatus: 'approved',
    totalCars: 0,
    totalListings: 0,
    totalPurchases: 0,
    reputationScore: 5.0,
  },
];

// Test cars for each user
const testCars = [
  // Alice's cars (luxury)
  {
    tokenId: 1001,
    vin: '1HGCM82633A001001',
    make: 'Mercedes-Benz',
    model: 'S-Class',
    year: 2023,
    color: 'Black',
    mileage: 5000,
    engineType: 'V8',
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    description: 'Luxury sedan with premium features',
    verificationStatus: 'approved',
    listingPrice: '85000',
    ownerAddress: '0x1234567890123456789012345678901234567890',
    createdBy: 'user_test_alice',
  },
  {
    tokenId: 1002,
    vin: '1HGCM82633A001002',
    make: 'BMW',
    model: '7 Series',
    year: 2022,
    color: 'White',
    mileage: 12000,
    engineType: 'I6',
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    description: 'Executive sedan with advanced technology',
    verificationStatus: 'approved',
    listingPrice: '72000',
    ownerAddress: '0x1234567890123456789012345678901234567890',
    createdBy: 'user_test_alice',
  },
  
  // Bob's cars (sports)
  {
    tokenId: 2001,
    vin: '1HGCM82633A002001',
    make: 'Porsche',
    model: '911 Carrera',
    year: 2023,
    color: 'Red',
    mileage: 3000,
    engineType: 'Flat-6',
    transmission: 'PDK',
    fuelType: 'Gasoline',
    description: 'Iconic sports car with exceptional performance',
    verificationStatus: 'approved',
    listingPrice: '120000',
    ownerAddress: '0x2345678901234567890123456789012345678901',
    createdBy: 'user_test_bob',
  },
  {
    tokenId: 2002,
    vin: '1HGCM82633A002002',
    make: 'Chevrolet',
    model: 'Corvette',
    year: 2023,
    color: 'Yellow',
    mileage: 2500,
    engineType: 'V8',
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    description: 'American muscle with modern tech',
    verificationStatus: 'approved',
    listingPrice: '75000',
    ownerAddress: '0x2345678901234567890123456789012345678901',
    createdBy: 'user_test_bob',
  },
  {
    tokenId: 2003,
    vin: '1HGCM82633A002003',
    make: 'Ford',
    model: 'Mustang GT',
    year: 2022,
    color: 'Blue',
    mileage: 8000,
    engineType: 'V8',
    transmission: 'Manual',
    fuelType: 'Gasoline',
    description: 'Classic muscle car with modern styling',
    verificationStatus: 'approved',
    listingPrice: '45000',
    ownerAddress: '0x2345678901234567890123456789012345678901',
    createdBy: 'user_test_bob',
  },
  
  // Charlie's cars (electric)
  {
    tokenId: 3001,
    vin: '1HGCM82633A003001',
    make: 'Tesla',
    model: 'Model S Plaid',
    year: 2023,
    color: 'White',
    mileage: 4000,
    engineType: 'Electric',
    transmission: 'Single-Speed',
    fuelType: 'Electric',
    description: 'Fastest production sedan, fully electric',
    verificationStatus: 'approved',
    listingPrice: '95000',
    ownerAddress: '0x3456789012345678901234567890123456789012',
    createdBy: 'user_test_charlie',
  },
  {
    tokenId: 3002,
    vin: '1HGCM82633A003002',
    make: 'Rivian',
    model: 'R1T',
    year: 2023,
    color: 'Green',
    mileage: 6000,
    engineType: 'Electric',
    transmission: 'Single-Speed',
    fuelType: 'Electric',
    description: 'Electric adventure truck',
    verificationStatus: 'approved',
    listingPrice: '78000',
    ownerAddress: '0x3456789012345678901234567890123456789012',
    createdBy: 'user_test_charlie',
  },
  
  // Diana's cars (SUV)
  {
    tokenId: 4001,
    vin: '1HGCM82633A004001',
    make: 'Range Rover',
    model: 'Sport',
    year: 2023,
    color: 'Gray',
    mileage: 7000,
    engineType: 'V6',
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    description: 'Luxury SUV with off-road capability',
    verificationStatus: 'approved',
    listingPrice: '92000',
    ownerAddress: '0x4567890123456789012345678901234567890123',
    createdBy: 'user_test_diana',
  },
  {
    tokenId: 4002,
    vin: '1HGCM82633A004002',
    make: 'Lexus',
    model: 'RX 450h',
    year: 2023,
    color: 'Silver',
    mileage: 5500,
    engineType: 'V6',
    transmission: 'CVT',
    fuelType: 'Hybrid',
    description: 'Reliable luxury hybrid SUV',
    verificationStatus: 'approved',
    listingPrice: '58000',
    ownerAddress: '0x4567890123456789012345678901234567890123',
    createdBy: 'user_test_diana',
  },
  {
    tokenId: 4003,
    vin: '1HGCM82633A004003',
    make: 'Jeep',
    model: 'Grand Cherokee',
    year: 2022,
    color: 'Black',
    mileage: 15000,
    engineType: 'V8',
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    description: 'Capable SUV for all terrains',
    verificationStatus: 'pending',
    listingPrice: '52000',
    ownerAddress: '0x4567890123456789012345678901234567890123',
    createdBy: 'user_test_diana',
  },
];

async function seedTestData() {
  try {
    console.log('🌱 Starting test data seeding...\n');

    // Create test users
    console.log('👥 Creating test users...');
    for (const userData of testUsers) {
      try {
        const existingUser = await User.findOne({ where: { walletAddress: userData.walletAddress } });
        if (existingUser) {
          console.log(`   ⚠️  User ${userData.firstName} already exists, skipping...`);
          continue;
        }
        
        await User.create(userData);
        console.log(`   ✅ Created user: ${userData.firstName} ${userData.lastName} (${userData.walletAddress.slice(0, 6)}...)`);
      } catch (error) {
        console.error(`   ❌ Error creating user ${userData.firstName}:`, error.message);
      }
    }

    console.log('\n🚗 Creating test cars...');
    for (const carData of testCars) {
      try {
        const existingCar = await Car.findOne({ where: { vin: carData.vin } });
        if (existingCar) {
          console.log(`   ⚠️  Car ${carData.make} ${carData.model} already exists, skipping...`);
          continue;
        }
        
        await Car.create({
          ...carData,
          metadataURI: `ipfs://mock-metadata-${carData.tokenId}`,
          images: [],
          documents: [],
          isListed: carData.listingPrice ? true : false,
          listingId: carData.tokenId,
        });
        console.log(`   ✅ Created: ${carData.year} ${carData.make} ${carData.model} (${carData.color})`);
      } catch (error) {
        console.error(`   ❌ Error creating car ${carData.make} ${carData.model}:`, error.message);
      }
    }

    // Update user car counts
    console.log('\n📊 Updating user statistics...');
    for (const user of testUsers) {
      const carCount = testCars.filter(car => car.createdBy === user.id).length;
      await User.update(
        { totalCars: carCount },
        { where: { id: user.id } }
      );
      console.log(`   ✅ Updated ${user.firstName}: ${carCount} cars`);
    }

    console.log('\n✅ Test data seeding completed successfully!');
    console.log('\n📝 Summary:');
    console.log(`   - Users created: ${testUsers.length}`);
    console.log(`   - Cars created: ${testCars.length}`);
    console.log('\n🎉 You can now test the application with these accounts!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding test data:', error);
    process.exit(1);
  }
}

// Run the seed function
seedTestData();

