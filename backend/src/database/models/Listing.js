import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.config.js';

const Listing = sequelize.define('Listing', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  listingId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true,
  },
  tokenId: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  sellerAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/,
    },
  },
  price: {
    type: DataTypes.DECIMAL(36, 18),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'ETH',
  },
  status: {
    type: DataTypes.ENUM('active', 'sold', 'cancelled', 'expired'),
    defaultValue: 'active',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  features: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  condition: {
    type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor'),
    allowNull: true,
  },
  mileage: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  soldAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  soldTo: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/,
    },
  },
  platformFee: {
    type: DataTypes.DECIMAL(36, 18),
    allowNull: true,
  },
  netAmount: {
    type: DataTypes.DECIMAL(36, 18),
    allowNull: true,
  },
  isEscrow: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  escrowDealId: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  txHash: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  blockchainStatus: {
    type: DataTypes.ENUM('pending', 'confirmed', 'failed'),
    defaultValue: 'pending',
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['listingId'],
    },
    {
      fields: ['tokenId'],
    },
    {
      fields: ['sellerAddress'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['price'],
    },
    {
      fields: ['createdAt'],
    },
    {
      fields: ['expiresAt'],
    },
  ],
});

// Instance methods
Listing.prototype.getFormattedPrice = function() {
  return parseFloat(this.price).toFixed(4);
};

Listing.prototype.isActive = function() {
  return this.status === 'active' &&
         (!this.expiresAt || new Date() < this.expiresAt);
};

Listing.prototype.canBePurchased = function() {
  return this.isActive() && this.blockchainStatus === 'confirmed';
};

Listing.prototype.calculateFees = function() {
  const platformFeeRate = 0.02; // 2%
  const platformFee = parseFloat(this.price) * platformFeeRate;
  const netAmount = parseFloat(this.price) - platformFee;

  return {
    platformFee: platformFee.toFixed(6),
    netAmount: netAmount.toFixed(6),
    platformFeeRate,
  };
};

export default Listing;

