import { sequelize } from '../../config/db.config.js';

// Import models
import User from './User.js';
import Car from './Car.js';
import Listing from './Listing.js';
import Transaction from './Transaction.js';
import Verification from './Verification.js';

// Define associations
// User associations
User.hasMany(Car, {
  foreignKey: 'createdBy',
  as: 'createdCars',
});

User.hasMany(Listing, {
  foreignKey: 'createdBy',
  as: 'createdListings',
});

User.hasMany(Transaction, {
  foreignKey: 'createdBy',
  as: 'createdTransactions',
});

User.hasMany(Verification, {
  foreignKey: 'createdBy',
  as: 'createdVerifications',
});

// Car associations
Car.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator',
});

Car.hasMany(Listing, {
  foreignKey: 'tokenId',
  as: 'listings',
});

Car.hasMany(Transaction, {
  foreignKey: 'tokenId',
  as: 'transactions',
});

// Listing associations
Listing.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator',
});

Listing.hasMany(Transaction, {
  foreignKey: 'listingId',
  as: 'transactions',
});

// Transaction associations
Transaction.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator',
});

Transaction.belongsTo(Car, {
  foreignKey: 'tokenId',
  as: 'car',
});

Transaction.belongsTo(Listing, {
  foreignKey: 'listingId',
  as: 'listing',
});

// Verification associations
Verification.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator',
});

Verification.belongsTo(User, {
  foreignKey: 'assignedTo',
  as: 'assignedVerifier',
});

// Export models and sequelize instance
export {
  sequelize,
  User,
  Car,
  Listing,
  Transaction,
  Verification,
};

export default {
  sequelize,
  User,
  Car,
  Listing,
  Transaction,
  Verification,
};

