# AutoToken Smart Contracts

Blockchain platform for tokenizing cars as NFTs with gasless transactions via Status Network/Linea zkEVM.

## Features

- **CarNFT**: ERC-721 tokens representing tokenized vehicles with VIN verification
- **Marketplace**: ETH-based trading platform with 2% platform fees
- **Escrow**: Secure payment holding for high-value transactions
- **GaslessMetaTx**: EIP-2771 support for gasless transactions
- **VerifierOracle**: Car verification system with role-based access
- **Roles**: Access control management for different user types

## Architecture

### Contracts Overview

1. **GaslessMetaTx.sol** - Base contract providing EIP-2771 meta-transaction support
2. **Roles.sol** - Access control roles (Admin, Verifier, Treasury)
3. **CarNFT.sol** - ERC-721 tokens for car ownership with verification status
4. **Marketplace.sol** - Trading platform with ETH payments and fees
5. **Escrow.sol** - Secure payment escrow for transactions
6. **VerifierOracle.sol** - Car verification and escrow release management

### Gasless Transactions

All contracts support gasless transactions through:
- EIP-2771 meta-transactions via trusted forwarders
- Status Network integration for seamless user experience
- No gas costs for users during minting and trading

### Security Features

- Role-based access control (RBAC) with OpenZeppelin
- Reentrancy protection on all state-changing functions
- Input validation and bounds checking
- Secure payment handling with proper refunds

## Installation

```bash
cd auto-token/smart-contracts
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Configure your environment variables:
```env
# Private Keys (use different keys for different networks)
PRIVATE_KEY=0x...

# Network RPC URLs
LINEA_TESTNET_RPC=https://rpc.sepolia.linea.build
STATUS_NETWORK_RPC=https://public.sepolia.status.network

# API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Development

### Compile Contracts
```bash
npm run compile
```

### Run Tests
```bash
npm test
```

### Run Tests with Gas Reporting
```bash
npm run test:gas
```

### Deploy to Local Network
```bash
npm run deploy:localhost
```

### Deploy to Linea Testnet
```bash
npm run deploy:linea
```

### Deploy to Status Network
```bash
npm run deploy:status
```

## Testing

### Test Coverage

The test suite covers:
- Contract deployment and initialization
- Car minting and verification
- Marketplace listing and trading
- Escrow creation and release
- Role management and access control
- Gasless transaction support
- Error handling and edge cases

### Running Specific Tests

```bash
# Run only CarNFT tests
npm test -- --grep "CarNFT"

# Run only Marketplace tests
npm test -- --grep "Marketplace"

# Run integration tests
npm test -- --grep "Integration"
```

## Deployment

### Local Development
```bash
# Start local Hardhat node
npx hardhat node

# Deploy in another terminal
npm run deploy:localhost
```

### Testnet Deployment
```bash
# Deploy to Linea testnet
npm run deploy:linea

# Verify contracts
npm run verify:linea
```

### Mainnet Deployment
1. Update private keys and API keys in `.env`
2. Ensure sufficient funds for deployment
3. Run deployment script:
```bash
npm run deploy:mainnet
```

## Contract Addresses

After deployment, addresses are saved to `deployment.json`. Example:
```json
{
  "network": "linea_testnet",
  "contracts": {
    "GaslessMetaTx": "0x...",
    "CarNFT": "0x...",
    "Marketplace": "0x...",
    "Escrow": "0x...",
    "VerifierOracle": "0x..."
  }
}
```

## Usage Flow

1. **Mint Car NFT**: User creates NFT with car details (VIN, make, model, etc.)
2. **Verification**: Verifier confirms car details and marks as verified
3. **List for Sale**: Owner lists verified car on marketplace with ETH price
4. **Purchase**: Buyer purchases car, payment goes to escrow
5. **Release**: Verifier confirms transaction, escrow releases payment to seller

## Gasless Integration

To enable gasless transactions:
1. Deploy trusted forwarder (GaslessMetaTx)
2. Configure relayer service to use forwarder address
3. Users sign meta-transactions instead of paying gas
4. Relayer submits transactions and pays gas fees

## Security Considerations

- All contracts use OpenZeppelin secure libraries
- Reentrancy protection on all payment functions
- Role-based access control prevents unauthorized actions
- Input validation prevents common attack vectors
- Secure payment handling with proper error recovery

## License

MIT License - see LICENSE file for details.

## Support

For technical support or questions:
- Check the documentation in `docs/` folder
- Review test files for usage examples
- Open issues on GitHub for bug reports

