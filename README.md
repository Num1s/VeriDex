# 🚗 VERIDEX - Gas-Free Car Tokenization Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-363636)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.0-yellow)](https://hardhat.org/)

> Tokenize your car as an NFT and trade with **zero gas fees** using Status Network and Linea zkEVM.


Veridex - is a decentralized profile platform where users can verify and showcase their real achievements through on-chain NFT badges.  
Each badge represents a certified course, competition, or project, allowing anyone to prove their skills transparently.  
Organizations can issue verified credentials directly to users’ wallets, creating a trustless reputation system.  
SkillProof aims to build a universal Web3 résumé for students and professionals.  
*Made during ETHBishkek 2025 hackathon.*

---

## 👥 Team Members
- Aitmyrza Dastanbekov  
- Nikita Undusk  
- Kubatov Kairat  
- Sultanbekov Nurbol

---

## 🎥 Demo Video
[Watch the demo here](#) <!-- Replace # with the final video link when ready -->


## ✨ Features

- 🚗 **Car Tokenization**: Turn your car into an ERC-721 NFT
- ⛽ **Gas-Free Transactions**: Zero gas fees using EIP-2771 meta-transactions
- 🔒 **VIN Verification**: Prevent duplicate cars with VIN validation
- 💰 **ETH-Based Trading**: Buy and sell cars with ETH (no platform token)
- 🔐 **Secure Escrow**: Optional escrow for high-value transactions
- 📱 **Responsive UI**: Beautiful mobile-first design
- 🌐 **Multi-Network**: Linea zkEVM + Status Network support
- 🎯 **Role-Based Access**: Admin, Verifier, and User roles

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │ Smart Contracts │
│   (Next.js)     │    │   (Node.js)     │    │   (Solidity)    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Wagmi + Viem  │    │ • Express API   │    │ • CarNFT        │
│ • RainbowKit    │◄──►│ • PostgreSQL    │◄──►│ • Marketplace   │
│ • TailwindCSS   │    │ • IPFS/Pinata   │    │ • Escrow        │
│ • React Query   │    │ • Redis Cache   │    │ • Oracle        │
│ • Meta-Tx UX    │    │ • Relayer       │    │ • Gasless       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/Num1s/VeriDex
cd VeriDex

# Install all dependencies
npm install
```

### 2. Smart Contracts

```bash
cd smart-contracts

# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to local network
npm run deploy:localhost
```

### 3. Backend API

```bash
cd backend

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Set up database
npm run migrate

# Start development server
npm run dev
```

### 4. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Start development server
npm run dev
```

### 5. Open Application

Navigate to http://localhost:3000 and start tokenizing cars! 🎉

## 📁 Project Structure

```
VeriDex/
├── smart-contracts/          # Solidity smart contracts
│   ├── contracts/           # Contract source files
│   ├── scripts/             # Deployment scripts
│   ├── test/                # Contract tests
│   └── hardhat.config.js    # Hardhat configuration
│
├── backend/                 # Node.js API backend
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── modules/         # API modules (auth, cars, etc.)
│   │   ├── database/        # Models and migrations
│   │   └── utils/           # Utility functions
│   └── package.json
│
├── frontend/                # Next.js frontend
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   └── utils/           # Utility functions
│   └── package.json
│
└── docs/                    # Documentation
    ├── architecture.md      # System architecture
    ├── gasless.md          # Gasless transactions guide
    └── api.md              # API documentation
```

## 💡 How It Works

### 1. Mint Car NFT
1. Connect your Web3 wallet
2. Enter car details (VIN, make, model, year)
3. Upload car photos
4. Submit for **gas-free** minting
5. Car NFT created and submitted for verification

### 2. Verification Process
1. Admin verifiers review car details
2. VIN verification against databases
3. Photo and document validation
4. Approval/rejection with notes
5. Verified cars can be listed

### 3. Marketplace Trading
1. List verified car with ETH price
2. Buyers browse and filter cars
3. Purchase with optional escrow
4. **All transactions are gas-free**
5. 2% platform fee collected

### 4. Gasless Magic ⚡
1. User signs transaction intent (not actual transaction)
2. Relayer service submits signed intent to blockchain
3. Relayer pays gas fees
4. Smart contract executes function
5. User gets confirmation without spending gas

## 🛠️ Technology Stack

### Blockchain Layer
- **Solidity**: Smart contract development
- **Hardhat**: Development framework
- **OpenZeppelin**: Security and standards
- **EIP-2771**: Meta-transaction support

### Backend Layer
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **PostgreSQL**: Primary database
- **Redis**: Caching and sessions
- **IPFS**: Decentralized storage
- **Ethers.js**: Blockchain interaction

### Frontend Layer
- **Next.js**: React framework
- **TypeScript**: Type safety
- **Wagmi**: Ethereum React hooks
- **RainbowKit**: Wallet connection
- **TailwindCSS**: Styling
- **React Query**: Server state management

### Infrastructure
- **Linea zkEVM**: Primary blockchain
- **Status Network**: Gasless provider
- **Pinata**: IPFS pinning service
- **Vercel/Netlify**: Frontend hosting

## 📊 Platform Economics

### Revenue Model
```
Platform Fee: 2% per transaction
├── Marketplace Trading: 2% of sale price
├── Gas Coverage: Platform pays gas fees
└── Treasury Management: Automated fee collection
```

### Cost Savings for Users
```
Traditional Web3 App:
🔥 Car Minting: $5-20 gas fees
🔥 Listing: $3-15 gas fees
🔥 Purchase: $5-25 gas fees
💸 Total: $13-60 in gas fees

AutoToken Platform:
✅ Car Minting: $0 gas fees
✅ Listing: $0 gas fees  
✅ Purchase: $0 gas fees
💚 Total: $0 in gas fees
```

## 🔐 Security Features

### Smart Contract Security
- **Access Control**: Role-based permissions
- **Reentrancy Protection**: All critical functions protected
- **Input Validation**: Comprehensive parameter checking
- **Audited Libraries**: OpenZeppelin battle-tested contracts

### Backend Security
- **Rate Limiting**: API abuse prevention
- **Input Sanitization**: SQL injection protection
- **CORS Policy**: Cross-origin request control
- **JWT Authentication**: Secure session management

### Frontend Security
- **Client-side Validation**: Input validation and sanitization
- **Wallet Security**: Never stores private keys
- **HTTPS Only**: Secure communication
- **Content Security Policy**: XSS protection

## 🌐 Supported Networks

| Network | Chain ID | Status | Purpose |
|---------|----------|---------|---------|
| **Linea Testnet** | 59140 | ✅ Ready | Primary testing |
| **Status Network** | 1946 | ✅ Ready | Gasless transactions |
| **Hardhat Local** | 31337 | ✅ Ready | Development |
| **Ethereum Mainnet** | 1 | 🔄 Planned | Production |
| **Linea Mainnet** | 59144 | 🔄 Planned | Production |

## 📖 Documentation

- 📋 [Architecture Overview](docs/architecture.md)
- ⚡ [Gasless Transactions Guide](docs/gasless.md)
- 🔗 [API Documentation](docs/api.md)
- 🚀 [Deployment Guide](docs/deployment.md)

## 🧪 Testing

### Smart Contracts
```bash
cd smart-contracts
npm test                # Run all tests
npm run test:gas        # Test with gas reporting
npm run coverage        # Coverage report
```

### Backend
```bash
cd backend
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

### Frontend
```bash
cd frontend
npm run build           # Build test
npm run lint            # Linting
npm run type-check      # TypeScript check
```

### Integration Testing
```bash
# Start all services
docker-compose up       # All services
npm run test:e2e        # End-to-end tests
```

## 🚀 Deployment

### Local Development
1. **Start Hardhat node**: `npx hardhat node`
2. **Deploy contracts**: `npm run deploy:localhost`
3. **Start backend**: `npm run dev`
4. **Start frontend**: `npm run dev`
5. **Open**: http://localhost:3000

### Testnet Deployment
1. **Configure environment variables**
2. **Deploy to Linea**: `npm run deploy:linea`
3. **Update contract addresses**
4. **Deploy backend to cloud**
5. **Deploy frontend to Vercel**

### Production Deployment
1. **Security audit contracts**
2. **Deploy to mainnet**
3. **Configure monitoring**
4. **Launch platform**

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Clone your fork
3. Install dependencies
4. Make changes
5. Run tests
6. Submit pull request

### Areas for Contribution
- 🐛 Bug fixes and improvements
- 📚 Documentation updates
- 🧪 Additional test coverage
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Website**: https://autotoken.com

## ⚠️ Disclaimer

This is experimental software. Use at your own risk. Always verify transactions and never invest more than you can afford to lose.

---

**Built with ❤️ for the future of automotive ownership**

*VeriDex - Making property ownership digital, global, and gas-free.*

