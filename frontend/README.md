# AutoToken Frontend

Next.js frontend application for the AutoToken RWA Platform. Built with TypeScript, Wagmi, RainbowKit, and TailwindCSS.

## Features

- **Wallet Integration**: Connect with MetaMask, WalletConnect, and other popular wallets
- **Gasless UX**: All transactions are gas-free using meta-transactions
- **Car Management**: Mint, view, and manage car NFTs
- **Marketplace**: List and purchase cars with ETH payments
- **Real-time Updates**: Live transaction status and blockchain sync
- **Responsive Design**: Mobile-first responsive design
- **Dark/Light Theme**: Theme switching support

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Blockchain**: Wagmi + Viem + RainbowKit
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: Node.js 20+)
- npm or yarn
- A Web3 wallet (MetaMask recommended)

### Installation

```bash
cd auto-token/frontend
npm install
```

### Configuration

1. Copy the environment template:
```bash
cp .env.example .env.local
```

2. Configure your environment variables:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-project-id
```

3. Update contract addresses after deploying smart contracts.

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage with marketplace
│   ├── mint/              # Car minting page
│   ├── marketplace/       # Marketplace page
│   ├── profile/           # User profile
│   ├── cars/[id]/         # Car detail page
│   └── admin/verify/      # Admin verification panel
├── components/            # Reusable UI components
│   ├── ui/                # Base UI components
│   ├── layout/            # Layout components (Header, Footer)
│   ├── CarCard.tsx        # Car display component
│   ├── WalletConnect.tsx  # Wallet connection
│   └── ...
├── hooks/                 # Custom React hooks
│   ├── useWalletAuth.ts   # Wallet authentication
│   ├── useCarContract.ts  # Car contract interactions
│   ├── useGasless.ts      # Gasless transactions
│   └── ...
├── services/              # API services
│   └── api.ts             # Backend API client
├── config/                # Configuration files
│   ├── wagmi.ts           # Wagmi configuration
│   ├── contracts.ts       # Contract addresses & ABIs
│   └── network.ts         # Network configurations
└── utils/                 # Utility functions
    ├── formatters.ts      # Data formatting
    └── validators.ts      # Input validation
```

## Key Pages

### Homepage (`/`)
- Marketplace with car listings
- Search and filter functionality
- Hero section with platform stats
- Featured cars grid

### Mint Page (`/mint`)
- Car NFT creation form
- Image upload with IPFS
- VIN validation
- Gasless minting

### Profile Page (`/profile`)
- User dashboard
- Owned cars management
- Listing history
- Transaction history
- Statistics

### Car Details (`/cars/[id]`)
- Detailed car information
- Image gallery
- Verification status
- Trading actions (list/buy)

### Admin Panel (`/admin/verify`)
- Verification queue management
- Car approval/rejection
- Document review
- Statistics dashboard

## Wallet Integration

The app uses RainbowKit for wallet connections:

```typescript
// Supported wallets
- MetaMask
- WalletConnect
- Coinbase Wallet
- Rainbow Wallet
- And many more...
```

### Authentication Flow

1. User connects wallet
2. Backend generates nonce
3. User signs authentication message
4. JWT token issued for API access
5. User authenticated for platform features

## Gasless Transactions

All transactions are gasless using EIP-2771 meta-transactions:

1. User signs transaction intent
2. Frontend submits to relayer service
3. Relayer pays gas and executes transaction
4. User sees confirmation without gas costs

## Smart Contract Integration

### Contract Addresses
Configure in `src/config/contracts.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  31337: { // Hardhat Local
    carNFT: '0x...',
    marketplace: '0x...',
    escrow: '0x...',
    // ...
  },
  59140: { // Linea Testnet
    carNFT: '0x...',
    // ...
  },
};
```

### Contract ABIs
Simplified ABIs are defined for frontend use in `contracts.ts`.

## API Integration

### Backend Communication
All API calls go through the centralized service in `src/services/api.ts`:

```typescript
// Example API usage
const cars = await carsAPI.getUserCars();
const listing = await marketplaceAPI.createListing(data);
const transaction = await gaslessAPI.mintCar(carData);
```

## Styling

### TailwindCSS Configuration
- Custom color palette for branding
- Responsive design utilities
- Dark mode support
- Component utilities

### UI Components
Built with Radix UI primitives and custom styling:
- Buttons, Cards, Badges
- Forms (Input, Textarea, Select)
- Navigation (Tabs, Links)
- Feedback (Toast, Loading states)

## State Management

### TanStack Query
Used for server state management:
- Automatic caching and synchronization
- Background refetching
- Optimistic updates
- Error handling

### Local State
React hooks for component-level state:
- Form state with React Hook Form
- UI state (modals, filters)
- User preferences

## Error Handling

### Global Error Boundary
Catches and displays user-friendly errors.

### API Error Handling
Standardized error responses with toast notifications.

### Form Validation
Zod schemas with real-time validation.

## Performance

### Image Optimization
- Next.js Image component
- IPFS image loading
- Progressive loading
- WebP format support

### Code Splitting
- Automatic code splitting with Next.js
- Dynamic imports for heavy components
- Lazy loading for images

### Caching Strategy
- API response caching with React Query
- Static asset caching
- Service worker for offline support

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

### Type Checking
```bash
npm run type-check
```

## Deployment

### Vercel Deployment
```bash
npm run build
```

### Environment Variables
Set in your hosting platform:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`
- Contract addresses

### Build Optimization
- Static site generation where possible
- Image optimization
- Bundle analysis

## Browser Support

- Chrome/Chromium 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## Wallet Requirements

- Web3 wallet with Ethereum support
- Sufficient ETH for escrow transactions
- Network switching capability

## Security

### Best Practices
- Input validation on all forms
- XSS protection with proper escaping
- CSRF protection with SameSite cookies
- Secure API communication

### Wallet Security
- Never stores private keys
- Signs transactions locally in wallet
- Validates all blockchain interactions

## Troubleshooting

### Common Issues

1. **Wallet not connecting**: Check browser wallet extension
2. **Transactions failing**: Verify network and contract addresses
3. **Images not loading**: Check IPFS gateway configuration
4. **API errors**: Verify backend service is running

### Development Issues

1. **Build failing**: Check TypeScript errors and dependencies
2. **Styles not loading**: Verify TailwindCSS configuration
3. **Hooks not working**: Check React version compatibility

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Run linting and type checking
5. Submit pull request

## License

MIT License - see LICENSE file for details.

## Support

For technical support:
- Check the documentation
- Review error logs
- Test on different networks
- Verify wallet connectivity