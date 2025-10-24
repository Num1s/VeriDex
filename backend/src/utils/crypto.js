import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(config.security.bcryptRounds);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error('Password hashing error:', error.message);
    throw error;
  }
};

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if passwords match
 */
export const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Password comparison error:', error.message);
    return false;
  }
};

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @param {string} expiresIn - Token expiration (default: config)
 * @returns {string} - JWT token
 */
export const generateToken = (payload, expiresIn = config.jwt.expiresIn) => {
  try {
    return jwt.sign(payload, config.jwt.secret, { expiresIn });
  } catch (error) {
    console.error('Token generation error:', error.message);
    throw error;
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} - Decoded token payload
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    console.error('Token verification error:', error.message);
    throw error;
  }
};

/**
 * Generate random string
 * @param {number} length - Length of random string
 * @returns {string} - Random string
 */
export const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate secure nonce for wallet authentication
 * @returns {string} - Secure nonce
 */
export const generateNonce = () => {
  return generateRandomString(16);
};

/**
 * Create authentication message for wallet signing
 * @param {string} nonce - Nonce for signing
 * @param {string} action - Action being authenticated
 * @returns {string} - Message to sign
 */
export const createAuthMessage = (nonce, action = 'login') => {
  const timestamp = Date.now();
  return `AutoToken ${action} - Nonce: ${nonce} - Timestamp: ${timestamp}`;
};

/**
 * Hash sensitive data for storage
 * @param {string} data - Data to hash
 * @returns {Promise<string>} - Hashed data
 */
export const hashSensitiveData = async (data) => {
  try {
    const salt = await bcrypt.genSalt(8); // Lower rounds for non-password data
    return await bcrypt.hash(data, salt);
  } catch (error) {
    console.error('Sensitive data hashing error:', error.message);
    throw error;
  }
};

/**
 * Verify data against hash
 * @param {string} data - Original data
 * @param {string} hash - Hash to verify against
 * @returns {Promise<boolean>} - True if data matches hash
 */
export const verifyHash = async (data, hash) => {
  try {
    return await bcrypt.compare(data, hash);
  } catch (error) {
    console.error('Hash verification error:', error.message);
    return false;
  }
};
