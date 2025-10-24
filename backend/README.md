# AutoToken Backend API

Node.js backend API for the AutoToken RWA Platform. Built with Express.js, PostgreSQL, Redis, and IPFS integration.

## Features

- **Wallet Authentication**: Nonce-based authentication with wallet signatures
- **Car Management**: Mint, verify, and manage car NFTs
- **Marketplace**: List and trade cars with ETH payments
- **Gasless Transactions**: EIP-2771 meta-transactions via trusted forwarders
- **IPFS Integration**: Upload and store car images and metadata
- **Role-based Access**: Admin, verifier, and user roles
- **Database**: PostgreSQL with Sequelize ORM
- **Caching**: Redis for performance optimization

## Tech Stack

- **Framework**: Express.js
- **Database**: PostgreSQL + Sequelize ORM
- **Caching**: Redis
- **File Storage**: IPFS via Pinata
- **Authentication**: JWT + Wallet signatures
- **Blockchain**: Ethers.js + Web3 integration
- **Validation**: Custom validators with VIN checking
- **Security**: Helmet, CORS, rate limiting

## Installation

```bash
cd auto-token/backend
npm install
```

## Configuration

1. Copy environment template:
```bash
cp .env.example .env
```

2. Configure your `.env` file:
```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=autotoken
DB_USER=postgres
DB_PASSWORD=password

# Blockchain
ETHEREUM_RPC_URL=https://sepolia.linea.build
PRIVATE_KEY=0x...

# IPFS
PINATA_API_KEY=your-pinata-key
PINATA_SECRET_KEY=your-pinata-secret

# JWT
JWT_SECRET=your-secret-key
```

3. Set up PostgreSQL database and create the `autotoken` database.

## Database Setup

```bash
# Run migrations
npm run migrate

# Seed database (optional)
npm run seed
```

## Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format
```

## API Documentation

### Authentication

#### Generate Nonce
```http
POST /api/auth/nonce
Content-Type: application/json

{
  "walletAddress": "0x1234...abcd"
}
```

#### Authenticate
```http
POST /api/auth/login
Content-Type: application/json

{
  "walletAddress": "0x1234...abcd",
  "signature": "0x...",
  "message": "AutoToken login - Nonce: 123456 - Timestamp: 1234567890"
}
```

### Cars

#### Mint Car NFT
```http
POST /api/cars
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "vin": "1HGCM82633A123456",
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "color": "Blue",
  "metadataURI": "ipfs://Qm...",
  "images": [file1, file2]
}
```

#### Get User's Cars
```http
GET /api/cars/my
Authorization: Bearer <token>
```

#### Search Cars
```http
GET /api/cars/search?make=Toyota&model=Camry&year=2020&limit=20
```

### Marketplace

#### Create Listing
```http
POST /api/marketplace/listings
Authorization: Bearer <token>
Content-Type: application/json

{
  "tokenId": 0,
  "price": "1.5",
  "description": "Excellent condition"
}
```

#### Get Active Listings
```http
GET /api/marketplace/listings?limit=20&offset=0
```

#### Purchase Listing
```http
POST /api/marketplace/listings/0/purchase
Authorization: Bearer <token>
Content-Type: application/json

{
  "useEscrow": true
}
```

### Gasless Transactions

#### Mint Car Gaslessly
```http
POST /api/gasless/mint
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "vin": "1HGCM82633A123456",
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "metadataURI": "ipfs://Qm...",
  "images": [file1, file2]
}
```

#### List Car Gaslessly
```http
POST /api/gasless/list
Authorization: Bearer <token>
Content-Type: application/json

{
  "tokenId": 0,
  "price": "1.5"
}
```

## Database Models

### User
- Wallet-based authentication
- Profile information (email, phone, etc.)
- KYC status and verification
- Reputation scoring
- Transaction statistics

### Car
- NFT token ID and ownership
- Vehicle details (VIN, make, model, year)
- Verification status
- Images and documents
- Listing information

### Listing
- Marketplace listings
- Pricing and fees
- Status tracking
- Transaction history

### Transaction
- Blockchain transaction tracking
- Gasless transaction support
- Status monitoring
- Fee calculations

### Verification
- Car verification requests
- Verifier assignments
- Status tracking
- Document management

## Security Features

- **Rate Limiting**: API request throttling
- **Input Validation**: Comprehensive data validation
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Input sanitization
- **CORS**: Configured cross-origin policies
- **Helmet**: Security headers
- **JWT Authentication**: Secure token-based auth

## Gasless Integration

The backend supports gasless transactions through:
- EIP-2771 meta-transactions
- Trusted forwarder pattern
- Biconomy/Status Network integration
- Automatic gas estimation
- Transaction status monitoring

## Error Handling

All endpoints return standardized error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Specific error details"],
  "stack": "Error stack (development only)"
}
```

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- cars.test.js
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT secrets
4. Configure trusted forwarder addresses
5. Set up SSL certificates
6. Configure monitoring and logging

## Monitoring

- Health check endpoint: `/health`
- Database connection monitoring
- Transaction status tracking
- Error logging and alerts
- Performance metrics

## License

MIT License - see LICENSE file for details.

## Support

For technical support or questions:
- Check API documentation
- Review error logs
- Monitor database performance
- Verify blockchain connections

