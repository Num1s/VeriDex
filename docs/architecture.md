# AutoToken Architecture

Comprehensive architecture documentation for the AutoToken RWA (Real World Assets) platform.

## Overview

AutoToken is a decentralized platform for tokenizing cars as NFTs with gasless transactions. The platform enables users to:

- Mint car NFTs with VIN verification
- Trade cars with ETH payments (no platform token)
- Utilize gasless transactions via EIP-2771 meta-transactions
- Verify car authenticity through oracle network

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │ Smart Contracts │
│   (Next.js)     │    │   (Node.js)     │    │   (Solidity)    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Wagmi/Viem    │    │ • Express API   │    │ • CarNFT        │
│ • RainbowKit    │◄──►│ • PostgreSQL    │◄──►│ • Marketplace   │
│ • TailwindCSS   │    │ • IPFS/Pinata   │    │ • Escrow        │
│ • React Query   │    │ • Redis Cache   │    │ • Oracle        │
│ • Meta-Tx       │    │ • Relayer       │    │ • Gasless       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                └───────┬───────────────┘
                                        │
                              ┌─────────▼─────────┐
                              │   Blockchain      │
                              │ Linea zkEVM      │
                              │ Status Network   │
                              └───────────────────┘
```

## Technology Stack

### Frontend Layer
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS + Radix UI
- **Blockchain**: Wagmi + Viem + RainbowKit
- **State**: TanStack Query
- **Forms**: React Hook Form + Zod

### Backend Layer
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Cache**: Redis for session and data caching
- **Storage**: IPFS via Pinata for images/metadata
- **Authentication**: JWT with wallet signatures
- **Blockchain**: Ethers.js for contract interaction

### Smart Contract Layer
- **Language**: Solidity ^0.8.19
- **Framework**: Hardhat with OpenZeppelin
- **Standards**: ERC-721, EIP-2771, AccessControl
- **Networks**: Linea zkEVM, Status Network
- **Security**: ReentrancyGuard, Role-based access

## Core Components

### 1. Smart Contracts

#### CarNFT.sol
- **Purpose**: ERC-721 tokens representing tokenized cars
- **Features**:
  - VIN-based uniqueness enforcement
  - Metadata URI storage (IPFS)
  - Verification status tracking
  - Gasless minting support

```solidity
contract CarNFT is ERC721, AccessControl, ReentrancyGuard, GaslessMetaTx {
    struct CarDetails {
        string vin;
        string make;
        string model;
        uint16 year;
        string color;
        bool verified;
        string metadataURI;
    }
}
```

#### Marketplace.sol
- **Purpose**: ETH-based car trading platform
- **Features**:
  - Create listings with price in ETH
  - Purchase with 2% platform fee
  - Escrow integration for high-value transactions
  - Gasless listing and purchasing

```solidity
contract Marketplace is AccessControl, ReentrancyGuard, GaslessMetaTx {
    uint256 public constant PLATFORM_FEE_BPS = 200; // 2%
    
    function createListing(uint256 tokenId, uint256 price) external returns (uint256);
    function purchaseListing(uint256 listingId) external payable;
}
```

#### Escrow.sol
- **Purpose**: Secure payment holding for transactions
- **Features**:
  - Multi-party escrow (buyer, seller, verifier)
  - Automated release after verification
  - Dispute resolution mechanism
  - Refund capabilities

#### VerifierOracle.sol
- **Purpose**: Car verification and escrow management
- **Features**:
  - Verification request handling
  - Oracle-based verification completion
  - Automatic escrow release
  - Fee management

### 2. Backend API

#### Authentication Module
- **Wallet-based auth**: Nonce + signature verification
- **JWT tokens**: Session management
- **Role-based access**: Admin, Verifier, User roles

#### Cars Module
- **Car CRUD operations**: Create, read, update car data
- **Image upload**: IPFS integration via Pinata
- **Metadata generation**: JSON metadata for NFTs
- **VIN validation**: Duplicate prevention and format validation

#### Marketplace Module
- **Listing management**: CRUD operations for car listings
- **Fee calculation**: Platform fee computation
- **Status tracking**: Listing state management
- **Search/filter**: Advanced query capabilities

#### Gasless Module
- **Meta-transaction relay**: EIP-2771 implementation
- **Transaction status**: Blockchain synchronization
- **Gas estimation**: Cost calculation
- **Batch processing**: Multiple transaction handling

### 3. Frontend Application

#### Page Structure
- **Homepage**: Marketplace with car listings
- **Mint**: Car NFT creation interface
- **Profile**: User dashboard and car management
- **Car Details**: Individual car information
- **Admin Panel**: Verification management (verifiers only)

#### Component Architecture
- **UI Components**: Reusable base components (Button, Card, etc.)
- **Feature Components**: Domain-specific components (CarCard, WalletConnect)
- **Layout Components**: Page structure (Header, Footer, Layout)
- **Form Components**: Input handling with validation

#### Hooks System
- **useWalletAuth**: Wallet connection and authentication
- **useCarContract**: Smart contract interactions
- **useGasless**: Meta-transaction handling
- **useMarketplace**: Trading operations

## Data Flow

### Car Minting Flow
```
User → Frontend → Backend → IPFS → Smart Contract → Blockchain
  ↓        ↓         ↓       ↓         ↓           ↓
Input   Validate   Store   Upload   Mint       Confirm
Form    Data      Images   Meta     NFT        Transaction
```

### Trading Flow
```
Seller → List Car → Smart Contract → Marketplace
  ↓         ↓           ↓              ↓
Owner    Create      Update          Display
         Listing     Database        Listing
                        ↓
Buyer → Purchase → Escrow → Verification → Release
  ↓        ↓         ↓         ↓            ↓
Select   Payment   Hold      Verify       Transfer
Car      ETH       Funds     Car          Ownership
```

### Gasless Transaction Flow
```
User → Sign Intent → Relayer Service → Blockchain
  ↓       ↓             ↓              ↓
Wallet  Meta-Tx       Pay Gas        Execute
Action  Signature     Fee            Transaction
```

## Security Model

### Smart Contract Security
- **Access Control**: Role-based permissions (Admin, Verifier, User)
- **Reentrancy Protection**: All state-changing functions protected
- **Input Validation**: Comprehensive parameter checking
- **Pausable Contracts**: Emergency stop functionality

### Backend Security
- **Rate Limiting**: API request throttling
- **Input Sanitization**: SQL injection and XSS prevention
- **CORS Protection**: Configured cross-origin policies
- **JWT Security**: Secure token handling

### Frontend Security
- **Wallet Integration**: Never stores private keys
- **Transaction Signing**: Local wallet signing only
- **Input Validation**: Client-side and server-side validation
- **Environment Variables**: Secure configuration management

## Network Integration

### Supported Networks

#### Linea zkEVM (Primary)
- **Chain ID**: 59140 (Testnet)
- **RPC**: https://rpc.sepolia.linea.build
- **Explorer**: https://sepolia.lineascan.build
- **Features**: Low fees, Ethereum compatibility

#### Status Network (Gasless)
- **Chain ID**: 1946 (Testnet)
- **RPC**: https://public.sepolia.status.network
- **Explorer**: https://public.sepolia.status.network
- **Features**: Meta-transaction support

### Gas Optimization
- **EIP-2771**: Meta-transactions for gasless UX
- **Batch Operations**: Multiple operations in single transaction
- **Optimized Contracts**: Minimal gas usage patterns

## IPFS Integration

### Content Storage
- **Car Images**: High-resolution photos stored on IPFS
- **Metadata**: JSON metadata with car details
- **Documents**: Verification documents (title, registration)
- **Gateway**: Pinata for reliable IPFS access

### Data Structure
```json
{
  "name": "2020 Toyota Camry",
  "description": "Tokenized vehicle",
  "image": "ipfs://Qm...",
  "attributes": [
    {"trait_type": "Make", "value": "Toyota"},
    {"trait_type": "Model", "value": "Camry"},
    {"trait_type": "Year", "value": 2020},
    {"trait_type": "VIN", "value": "1HGCM82633A123456"},
    {"trait_type": "Verified", "value": true}
  ],
  "images": [
    {"url": "ipfs://Qm...", "filename": "front.jpg"},
    {"url": "ipfs://Qm...", "filename": "side.jpg"}
  ]
}
```

## Database Schema

### Core Tables

#### Users
- User profiles and authentication
- Wallet addresses and KYC status
- Reputation and statistics

#### Cars
- Vehicle information and ownership
- Verification status and history
- Metadata and images

#### Listings
- Marketplace listings and pricing
- Status tracking and fees
- Escrow information

#### Transactions
- Blockchain transaction history
- Gasless transaction tracking
- Status and confirmation data

#### Verifications
- Verification requests and status
- Verifier assignments
- Documentation and notes

## API Endpoints

### Authentication
```http
POST /api/auth/nonce          # Generate nonce
POST /api/auth/login          # Wallet authentication
GET  /api/auth/profile        # User profile
PUT  /api/auth/profile        # Update profile
```

### Cars
```http
POST /api/cars                # Mint car NFT
GET  /api/cars/my             # User's cars
GET  /api/cars/search         # Search cars
GET  /api/cars/:id            # Car details
PUT  /api/cars/:id            # Update car
```

### Marketplace
```http
POST /api/marketplace/listings     # Create listing
GET  /api/marketplace/listings     # Get listings
POST /api/marketplace/listings/:id/purchase  # Purchase car
DELETE /api/marketplace/listings/:id  # Cancel listing
```

### Gasless
```http
POST /api/gasless/mint        # Gasless minting
POST /api/gasless/list        # Gasless listing
POST /api/gasless/purchase    # Gasless purchase
GET  /api/gasless/transactions  # Transaction history
```

## Deployment Architecture

### Development Environment
```
Frontend: http://localhost:3000
Backend:  http://localhost:3001
Database: localhost:5432 (PostgreSQL)
Cache:    localhost:6379 (Redis)
Blockchain: http://localhost:8545 (Hardhat)
```

### Production Environment
```
Frontend: Vercel/Netlify deployment
Backend:  Cloud service (AWS/Railway)
Database: Managed PostgreSQL (AWS RDS)
Cache:    Managed Redis (AWS ElastiCache)
Blockchain: Linea Mainnet + Status Network
```

### Infrastructure Requirements
- **Frontend**: Static hosting with CDN
- **Backend**: Container deployment with autoscaling
- **Database**: High-availability PostgreSQL cluster
- **Cache**: Redis cluster for session storage
- **Storage**: IPFS pinning service (Pinata)

## Monitoring and Observability

### Metrics
- **Transaction Success Rate**: Gasless transaction reliability
- **Verification Time**: Average car verification duration
- **Platform Usage**: User engagement and retention
- **Trading Volume**: ETH volume and fee collection

### Logging
- **Application Logs**: Structured logging with correlation IDs
- **Transaction Logs**: Blockchain event monitoring
- **Error Tracking**: Centralized error collection
- **Performance Metrics**: API response times and database query performance

### Alerts
- **System Health**: Service availability and performance
- **Security Events**: Failed authentication attempts
- **Business Metrics**: Unusual trading patterns
- **Infrastructure**: Resource utilization and capacity

## Future Enhancements

### Phase 2 Features
- **Mobile App**: React Native implementation
- **Advanced Search**: ML-powered car recommendations
- **Insurance Integration**: On-chain insurance products
- **Loan/Financing**: DeFi lending against car NFTs

### Scaling Considerations
- **Multi-chain Support**: Polygon, Arbitrum, Base
- **Layer 2 Integration**: Additional L2 solutions
- **Enterprise Features**: Fleet management for businesses
- **API Rate Limiting**: Enhanced throttling and quotas

## Compliance and Legal

### Data Privacy
- **GDPR Compliance**: EU data protection regulations
- **User Consent**: Clear consent mechanisms
- **Data Retention**: Automated data lifecycle management

### Financial Regulations
- **AML/KYC**: Know Your Customer verification
- **Transaction Monitoring**: Suspicious activity detection
- **Reporting**: Regulatory reporting capabilities

This architecture provides a robust foundation for a production-ready car tokenization platform with excellent user experience and security.

