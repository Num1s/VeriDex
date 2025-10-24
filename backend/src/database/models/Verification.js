import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.config.js';

const Verification = sequelize.define('Verification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  requestId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true,
  },
  tokenId: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  requesterAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/,
    },
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'expired'),
    defaultValue: 'pending',
  },
  vin: {
    type: DataTypes.STRING,
    allowNull: false,
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
  },
  documents: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  verificationNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  verificationDocuments: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  verificationFee: {
    type: DataTypes.DECIMAL(36, 18),
    allowNull: true,
  },
  verifierAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/,
    },
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
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
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  additionalInfo: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal',
  },
  assignedTo: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/,
    },
  },
  estimatedValue: {
    type: DataTypes.DECIMAL(36, 18),
    allowNull: true,
  },
  riskScore: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 10,
    },
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
      fields: ['requestId'],
    },
    {
      fields: ['tokenId'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['requesterAddress'],
    },
    {
      fields: ['verifierAddress'],
    },
    {
      fields: ['verifiedAt'],
    },
    {
      fields: ['expiresAt'],
    },
    {
      fields: ['priority'],
    },
  ],
});

// Instance methods
Verification.prototype.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

Verification.prototype.isPending = function() {
  return this.status === 'pending' && !this.isExpired();
};

Verification.prototype.canBeProcessed = function() {
  return this.isPending() && this.blockchainStatus === 'confirmed';
};

Verification.prototype.getFormattedFee = function() {
  if (!this.verificationFee) return null;
  return parseFloat(this.verificationFee).toFixed(6);
};

Verification.prototype.getTimeRemaining = function() {
  if (!this.expiresAt) return null;

  const now = new Date();
  const expires = new Date(this.expiresAt);
  const diffMs = expires - now;

  if (diffMs <= 0) return 'Expired';

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (diffDays > 0) {
    return `${diffDays}d ${diffHours}h`;
  }
  return `${diffHours}h`;
};

export default Verification;

