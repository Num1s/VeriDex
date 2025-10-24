import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.config.js';

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  txHash: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  type: {
    type: DataTypes.ENUM('mint', 'transfer', 'listing', 'purchase', 'escrow', 'verification', 'gasless'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'failed', 'cancelled'),
    defaultValue: 'pending',
  },
  fromAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/,
    },
  },
  toAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/,
    },
  },
  amount: {
    type: DataTypes.DECIMAL(36, 18),
    allowNull: true,
  },
  gasUsed: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  gasPrice: {
    type: DataTypes.DECIMAL(36, 18),
    allowNull: true,
  },
  tokenId: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  listingId: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  escrowDealId: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  contractAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/,
    },
  },
  methodName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  parameters: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  error: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  blockNumber: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  blockHash: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  confirmationCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isGasless: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  relayerAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/,
    },
  },
  userSignature: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  nonce: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  network: {
    type: DataTypes.STRING,
    defaultValue: 'linea',
  },
  chainId: {
    type: DataTypes.INTEGER,
    defaultValue: 59140,
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  processedAt: {
    type: DataTypes.DATE,
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
}, {
  indexes: [
    {
      unique: true,
      fields: ['txHash'],
    },
    {
      fields: ['type'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['fromAddress'],
    },
    {
      fields: ['toAddress'],
    },
    {
      fields: ['tokenId'],
    },
    {
      fields: ['listingId'],
    },
    {
      fields: ['blockNumber'],
    },
    {
      fields: ['createdAt'],
    },
  ],
});

// Instance methods
Transaction.prototype.getFormattedAmount = function() {
  if (!this.amount) return null;
  return parseFloat(this.amount).toFixed(6);
};

Transaction.prototype.getGasCost = function() {
  if (!this.gasUsed || !this.gasPrice) return null;

  const gasCost = parseFloat(this.gasUsed) * parseFloat(this.gasPrice);
  return {
    wei: gasCost.toString(),
    eth: (gasCost / 1e18).toFixed(6),
  };
};

Transaction.prototype.isConfirmed = function() {
  return this.status === 'confirmed' && this.confirmationCount >= 1;
};

Transaction.prototype.getExplorerUrl = function() {
  const baseUrls = {
    1: 'https://etherscan.io/tx/',
    59140: 'https://lineascan.build/tx/',
    1946: 'https://public.sepolia.status.network/tx/',
  };

  const baseUrl = baseUrls[this.chainId] || baseUrls[1];
  return `${baseUrl}${this.txHash}`;
};

export default Transaction;
