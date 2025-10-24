import { DataTypes } from 'sequelize';
import db from '../../config/db.config.cjs';
const { sequelize } = db;

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  walletAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/,
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  kycStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'not_submitted'),
    defaultValue: 'not_submitted',
  },
  kycDocuments: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  nonce: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  totalCars: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalListings: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalPurchases: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  reputationScore: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 5.00,
    validate: {
      min: 0,
      max: 5,
    },
  },
  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  blockedReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  preferences: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['walletAddress'],
    },
    {
      fields: ['kycStatus'],
    },
    {
      fields: ['isVerified'],
    },
    {
      fields: ['isBlocked'],
    },
  ],
});

// Instance methods
User.prototype.getFullName = function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.lastName || this.walletAddress.slice(0, 10) + '...';
};

User.prototype.updateStats = async function() {
  // This would be implemented to update totalCars, totalListings, etc.
  // For now, just return the current stats
  return {
    totalCars: this.totalCars,
    totalListings: this.totalListings,
    totalPurchases: this.totalPurchases,
  };
};

export default User;

