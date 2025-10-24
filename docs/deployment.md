# AutoToken Deployment Guide

Complete guide for deploying the AutoToken platform across different environments.

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL database
- Redis instance
- IPFS pinning service (Pinata account)
- Ethereum wallet with test ETH

## Environment Setup

### 1. Local Development (Docker)

```bash
# Clone repository
git clone https://github.com/autotoken/autotoken
cd auto-token

# Start all services
docker-compose up -d

# Wait for services to be healthy
docker-compose logs -f

# Deploy contracts to local Hardhat network
cd smart-contracts
npm run deploy:localhost

# Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# Hardhat: http://localhost:8545
```

### 2. Local Development (Manual)

```bash
# 1. Start PostgreSQL and Redis
# Use Docker or local installation

# 2. Smart Contracts
cd smart-contracts
npm install
npm run compile
npx hardhat node --hostname 0.0.0.0  # Terminal 1
npm run deploy:localhost              # Terminal 2

# 3. Backend
cd ../backend
npm install
cp .env.example .env
# Configure .env with database credentials
npm run migrate
npm run dev                          # Terminal 3

# 4. Frontend  
cd ../frontend
npm install
cp .env.example .env.local
# Configure .env.local with API URLs
npm run dev                          # Terminal 4
```

## Production Deployment

### 1. Smart Contracts (Linea Testnet)

```bash
cd smart-contracts

# Configure environment
export PRIVATE_KEY="0x..."
export LINEA_TESTNET_RPC="https://rpc.sepolia.linea.build"
export ETHERSCAN_API_KEY="your-api-key"

# Deploy contracts
npm run deploy:linea

# Verify contracts
npm run verify:linea

# Save contract addresses for backend/frontend configuration
```

### 2. Backend (Cloud Deployment)

#### Option A: Railway Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up

# Configure environment variables in Railway dashboard
```

#### Option B: AWS/DigitalOcean
```bash
# Build Docker image
cd backend
docker build -t autotoken-backend .

# Deploy to container service
# Configure environment variables in cloud provider
```

#### Environment Variables (Production)
```env
NODE_ENV=production
PORT=3001

# Database (managed PostgreSQL)
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=autotoken
DB_USER=postgres
DB_PASSWORD=secure-password

# Redis (managed Redis)
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=redis-password

# Blockchain
ETHEREUM_RPC_URL=https://rpc.sepolia.linea.build
PRIVATE_KEY=0x...  # Relayer wallet private key
CHAIN_ID=59140

# IPFS
PINATA_API_KEY=your-pinata-key
PINATA_SECRET_KEY=your-pinata-secret

# Security
JWT_SECRET=super-secure-jwt-secret
ADMIN_WALLET_ADDRESS=0x...  # Admin wallet

# CORS
FRONTEND_URL=https://autotoken.vercel.app
```

### 3. Frontend (Vercel Deployment)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel

# Configure environment variables in Vercel dashboard
```

#### Environment Variables (Production)
```env
NEXT_PUBLIC_APP_URL=https://autotoken.vercel.app
NEXT_PUBLIC_API_URL=https://api.autotoken.com/api
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-project-id
NEXT_PUBLIC_CHAIN_ID=59140

# Contract addresses (from deployment)
NEXT_PUBLIC_CAR_NFT_ADDRESS=0x...
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x...
NEXT_PUBLIC_ESCROW_ADDRESS=0x...
NEXT_PUBLIC_VERIFIER_ORACLE_ADDRESS=0x...
NEXT_PUBLIC_TRUSTED_FORWARDER_ADDRESS=0x...
```

## Configuration Checklist

### Smart Contracts ✅
- [ ] Deployed to target network
- [ ] Contract addresses recorded
- [ ] Etherscan verification complete
- [ ] Initial roles assigned (admin, verifier)
- [ ] Treasury address configured

### Backend API ✅
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] IPFS service connected
- [ ] Blockchain RPC connected
- [ ] Relayer wallet funded
- [ ] Health checks passing

### Frontend ✅
- [ ] Contract addresses updated
- [ ] API endpoints configured
- [ ] Wallet Connect project ID set
- [ ] Environment variables set
- [ ] Build successful
- [ ] Deployment working

### Infrastructure ✅
- [ ] SSL certificates installed
- [ ] Domain names configured
- [ ] CDN configured (if applicable)
- [ ] Monitoring setup
- [ ] Backup strategy implemented

## Testing Deployment

### 1. Smart Contract Testing
```bash
# Test contract functions
npx hardhat console --network linea_testnet

# Test minting
const CarNFT = await ethers.getContractFactory("CarNFT");
const carNFT = await CarNFT.attach("DEPLOYED_ADDRESS");
await carNFT.mintCar(...);
```

### 2. Backend API Testing
```bash
# Health check
curl https://api.autotoken.com/health

# Test authentication
curl -X POST https://api.autotoken.com/api/auth/nonce \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "0x..."}'

# Test car creation
curl -X POST https://api.autotoken.com/api/cars \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "vin=1HGCM82633A123456" \
  -F "make=Toyota" \
  -F "model=Camry" \
  -F "year=2020"
```

### 3. Frontend Testing
```bash
# Check pages load
curl -I https://autotoken.vercel.app
curl -I https://autotoken.vercel.app/mint
curl -I https://autotoken.vercel.app/profile

# Check wallet connection
# Test with MetaMask on Linea testnet
```

## Monitoring Setup

### Application Monitoring
```bash
# Backend health endpoint
GET /health
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}

# Database connectivity
GET /api/health/db
{
  "database": "connected",
  "redis": "connected", 
  "ipfs": "connected",
  "blockchain": "connected"
}
```

### Log Aggregation
```bash
# Centralized logging (example with LogDNA/DataDog)
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Backup Strategy

### Database Backup
```bash
# Automated PostgreSQL backups
pg_dump autotoken > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql autotoken < backup_20240101_120000.sql
```

### Contract Backup
- Contract source code in git repository
- ABI files stored in frontend/backend
- Deployment addresses documented
- Private keys securely stored

## Security Hardening

### Infrastructure Security
- Enable SSL/TLS for all endpoints
- Configure firewall rules (only necessary ports)
- Use managed services for database/cache
- Regular security updates

### Application Security
- Environment variables stored securely
- API rate limiting configured
- Input validation on all endpoints
- Error messages don't leak sensitive info

### Blockchain Security
- Relayer wallet funded with minimal ETH
- Private keys stored in secure key management
- Contract permissions properly configured
- Emergency pause functionality tested

## Scaling Considerations

### Traffic Scaling
- CDN for static assets (Cloudflare)
- Load balancing for backend API
- Database read replicas
- Redis clustering

### Blockchain Scaling
- Multiple RPC providers for redundancy
- Transaction queue for high volume
- Gas price optimization
- Batch transaction processing

## Troubleshooting

### Common Issues

#### Contract Deployment Fails
```bash
# Check network configuration
npx hardhat verify --network linea_testnet DEPLOYED_ADDRESS

# Verify gas settings
# Check wallet balance
# Confirm RPC URL
```

#### Backend Won't Start
```bash
# Check environment variables
npm run dev 2>&1 | grep -i error

# Test database connection
npm run migrate

# Check port availability
lsof -i :3001
```

#### Frontend Build Fails
```bash
# Check TypeScript errors
npm run type-check

# Fix linting issues  
npm run lint --fix

# Clear cache
rm -rf .next
npm run build
```

### Debug Commands

#### Check Service Health
```bash
# All services
docker-compose ps

# Individual service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

#### Database Debug
```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d autotoken

# Check tables
\dt

# Check migrations
SELECT * FROM SequelizeMeta;
```

#### Redis Debug
```bash
# Connect to Redis
docker-compose exec redis redis-cli

# Check keys
KEYS *

# Monitor commands
MONITOR
```

## Performance Tuning

### Database Optimization
```sql
-- Create indexes for common queries
CREATE INDEX CONCURRENTLY idx_cars_owner ON cars(owner_address);
CREATE INDEX CONCURRENTLY idx_listings_active ON listings(status) WHERE status = 'active';

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM cars WHERE owner_address = '0x...';
```

### API Optimization
```javascript
// Enable compression
app.use(compression());

// Cache responses
app.use('/api/cars/stats', cache('5 minutes'));

// Connection pooling
const sequelize = new Sequelize(DATABASE_URL, {
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});
```

### Frontend Optimization
```javascript
// Code splitting
const AdminPanel = dynamic(() => import('./AdminPanel'), {
  loading: () => <LoadingSpinner />,
});

// Image optimization
import Image from 'next/image';

<Image
  src={carImage}
  alt="Car"
  width={400}
  height={300}
  placeholder="blur"
  priority={false}
/>
```

## Rollback Strategy

### Quick Rollback Process
1. **Frontend**: Revert Vercel deployment
2. **Backend**: Rollback to previous container version
3. **Database**: Restore from backup (if needed)
4. **Contracts**: Cannot be rolled back (use upgrade pattern)

### Emergency Procedures
1. **Pause Contracts**: Use emergency pause function
2. **Scale Down**: Reduce traffic to backend
3. **Notify Users**: Status page updates
4. **Incident Response**: Follow incident playbook

This deployment guide ensures a smooth and secure launch of the AutoToken platform.
