# Car NFT - Complete Fields Reference

## Overview
This document describes all fields available in the Car NFT system and where they are displayed.

## Car Model Fields

### Basic Information
| Field | Type | Required | Description | Display Location |
|-------|------|----------|-------------|------------------|
| `id` | UUID | Yes | Unique identifier | All pages |
| `tokenId` | Number | No | Blockchain token ID | Detail page, Card badge |
| `vin` | String | Yes | Vehicle Identification Number (17 chars) | Detail page, Card |
| `make` | String | Yes | Car manufacturer (e.g., Toyota) | All pages |
| `model` | String | Yes | Car model name | All pages |
| `year` | Number | Yes | Manufacturing year | All pages |
| `color` | String | No | Exterior color | Detail page, Quick Stats |
| `mileage` | Number | No | Total miles driven | Detail page, Card, Quick Stats |

### Technical Specifications
| Field | Type | Required | Description | Display Location |
|-------|------|----------|-------------|------------------|
| `engineType` | String | No | Engine type/size (e.g., "V6 3.5L") | Detail page, Quick Stats |
| `transmission` | String | No | Transmission type (e.g., "Automatic") | Detail page, Quick Stats |
| `fuelType` | String | No | Fuel type (e.g., "Gasoline", "Electric") | Detail page, Quick Stats |

### Metadata
| Field | Type | Required | Description | Display Location |
|-------|------|----------|-------------|------------------|
| `description` | Text | No | Detailed description of the vehicle | Detail page header |
| `metadataURI` | String | No | IPFS URI for metadata | Detail page blockchain section |
| `images` | JSON Array | No | Array of uploaded images | Gallery, Thumbnails |
| `documents` | JSON Array | No | Array of documents (title, registration, etc.) | Detail page documents section |

### Ownership & Status
| Field | Type | Required | Description | Display Location |
|-------|------|----------|-------------|------------------|
| `ownerAddress` | String | Yes | Current owner's wallet address | Detail page owner section |
| `createdBy` | String | Yes | Creator user ID | Backend tracking |
| `verificationStatus` | Enum | Yes | 'pending', 'approved', 'rejected' | Badge on all pages |
| `verificationNotes` | Text | No | Admin notes on verification | Detail page verification section |
| `verifiedBy` | String | No | Verifier wallet address | Detail page verification section |
| `verifiedAt` | Date | No | Verification timestamp | Detail page verification section |

### Marketplace
| Field | Type | Required | Description | Display Location |
|-------|------|----------|-------------|------------------|
| `isListed` | Boolean | No | Whether car is listed for sale | Badge, Quick Stats |
| `listingPrice` | Decimal | No | Sale price in ETH | Price badge, sidebar |
| `listingId` | Number | No | Marketplace listing ID | Backend tracking |
| `isEscrow` | Boolean | No | Whether in escrow transaction | Quick Stats |
| `escrowDealId` | Number | No | Escrow deal ID | Backend tracking |

### Timestamps
| Field | Type | Required | Description | Display Location |
|-------|------|----------|-------------|------------------|
| `createdAt` | Date | Yes | Creation timestamp | Detail page, Card footer |
| `updatedAt` | Date | Yes | Last update timestamp | Backend tracking |
| `deletedAt` | Date | No | Soft delete timestamp | Backend (paranoid mode) |

## Display Pages

### 1. Car Card (Profile, Marketplace, Home)
- **Compact View**: Make/Model/Year, VIN, Status badge, Price
- **Full View**: Image, Make/Model/Year, VIN, Mileage, Color, Status, Price, Owner, Actions

### 2. Car Detail Page (`/cars/[id]`)
- **Image Gallery**: Main image with navigation, thumbnails
- **Header Section**: Title, VIN, Token ID, Description
- **Basic Information**: Make, Model, Year, Color, Mileage, Status
- **Technical Specifications**: Engine, Transmission, Fuel Type
- **Owner Information**: Owner name/address, wallet address
- **Blockchain Information**: Token ID, Network, Minted date, Metadata URI
- **Documents**: List of all attached documents with view links
- **Verification Status**: Status badge, notes, verified by, verified date
- **Quick Stats** (Sidebar): All key specs in compact format
- **Actions** (Sidebar): List/Buy/Edit buttons based on ownership
- **Transaction History** (Sidebar): Mint date, verification date, listing info

### 3. Profile Page (`/profile`)
- Shows user's cars in grid layout
- Stats: Total Assets, Verified count, Listed count
- Tabs: Overview, My Assets, Listed, Activity

## Image & Document Structure

### Images Array
```json
[
  {
    "url": "https://gateway.pinata.cloud/ipfs/...",
    "hash": "Qm...",
    "filename": "car_front.jpg"
  }
]
```

### Documents Array
```json
[
  {
    "name": "Vehicle Title",
    "url": "https://gateway.pinata.cloud/ipfs/...",
    "hash": "Qm...",
    "filename": "title.pdf"
  }
]
```

## UI Components

### CarCard Component
- Props: `car`, `showOwner`, `showPrice`, `compact`, `showTransfer`, `onPurchase`, `onTransfer`
- Two modes: compact (list view) and full (grid view)
- Click "View Details" to navigate to detail page

### Car Detail Page
- Interactive image gallery with navigation arrows
- Thumbnail selection
- Organized sections with gradient backgrounds
- Responsive layout (desktop: 2 columns + sidebar, mobile: 1 column)
- Action buttons based on ownership and listing status

## Development Notes

1. All images are stored on IPFS via Pinata
2. Metadata URI points to IPFS metadata JSON
3. VIN must be exactly 17 characters (standard VIN format)
4. Verification status affects which actions are available
5. Only verified cars can be listed for sale
6. Owner sees different actions than non-owners
7. All addresses are compared case-insensitively
8. Soft delete is enabled (paranoid mode)

## API Endpoints

- `GET /api/cars/my` - Get user's cars
- `GET /api/cars/:id` - Get car details
- `POST /api/cars` - Create new car (with images upload)
- `PUT /api/cars/:id` - Update car details
- `POST /api/cars/:id/transfer` - Transfer ownership
- `GET /api/cars/search` - Search cars with filters

## Future Enhancements

- [ ] Add more images to gallery (currently supports multiple)
- [ ] Add video support
- [ ] Add 360° view support
- [ ] Add car history/provenance tracking
- [ ] Add maintenance records
- [ ] Add accident history
- [ ] Add insurance information
- [ ] Add location/GPS data
- [ ] Add QR code for physical verification
- [ ] Add NFT metadata standards (ERC-721)



