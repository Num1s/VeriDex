import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.config.js';

const Car = sequelize.define('Car', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tokenId: {
    type: DataTypes.BIGINT,
    allowNull: true,
    unique: true,
  },
  ownerAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/,
    },
  },
  vin: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [17, 17],
      is: /^[A-HJ-NPR-Z0-9]+$/i,
    },
  },
  make: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1900,
      max: new Date().getFullYear() + 2,
    },
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mileage: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  engineType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  transmission: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fuelType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  metadataURI: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  documents: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  verificationStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  verificationNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  verifiedBy: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isListed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  listingPrice: {
    type: DataTypes.DECIMAL(36, 18),
    allowNull: true,
  },
  listingId: {
    type: DataTypes.BIGINT,
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
      fields: ['tokenId'],
    },
    {
      unique: true,
      fields: ['vin'],
    },
    {
      fields: ['ownerAddress'],
    },
    {
      fields: ['verificationStatus'],
    },
    {
      fields: ['isListed'],
    },
    {
      fields: ['make', 'model'],
    },
    {
      fields: ['year'],
    },
  ],
});

// Instance methods
Car.prototype.getDisplayName = function() {
  return `${this.year} ${this.make} ${this.model}`;
};

Car.prototype.getFormattedPrice = function() {
  if (!this.listingPrice) return null;
  return parseFloat(this.listingPrice).toFixed(4);
};

Car.prototype.isVerified = function() {
  return this.verificationStatus === 'approved';
};

Car.prototype.canBeListed = function() {
  return this.verificationStatus === 'approved' && !this.isListed;
};

export default Car;

