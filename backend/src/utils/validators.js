import web3Service from './web3.js';

/**
 * Validate VIN (Vehicle Identification Number)
 * @param {string} vin - VIN to validate
 * @returns {boolean} - True if valid VIN format
 */
export const isValidVIN = (vin) => {
  if (!vin || typeof vin !== 'string') {
    return false;
  }

  // VIN should be 17 characters long
  if (vin.length !== 17) {
    return false;
  }

  // VIN should only contain alphanumeric characters (no I, O, Q)
  const vinRegex = /^[A-HJ-NPR-Z0-9]+$/i;
  return vinRegex.test(vin);
};

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone format
 */
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Simple phone validation - digits, spaces, dashes, parentheses, plus
  const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * Validate car year
 * @param {number} year - Year to validate
 * @returns {boolean} - True if valid year
 */
export const isValidYear = (year) => {
  const currentYear = new Date().getFullYear();
  return Number.isInteger(year) && year >= 1900 && year <= currentYear + 2;
};

/**
 * Validate price (ETH amount)
 * @param {string|number} price - Price to validate
 * @returns {boolean} - True if valid price
 */
export const isValidPrice = (price) => {
  try {
    const num = parseFloat(price);
    return !isNaN(num) && num > 0 && num < 1000000; // Max 1M ETH
  } catch {
    return false;
  }
};

/**
 * Validate file type for uploads
 * @param {string} mimeType - MIME type to validate
 * @param {Array} allowedTypes - Array of allowed MIME types
 * @returns {boolean} - True if valid file type
 */
export const isValidFileType = (mimeType, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']) => {
  return allowedTypes.includes(mimeType);
};

/**
 * Validate file size
 * @param {number} size - File size in bytes
 * @param {number} maxSize - Maximum allowed size in bytes
 * @returns {boolean} - True if file size is valid
 */
export const isValidFileSize = (size, maxSize = 10 * 1024 * 1024) => { // 10MB default
  return size > 0 && size <= maxSize;
};

/**
 * Sanitize string input
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeString = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input.trim().replace(/[<>]/g, '');
};

/**
 * Validate wallet address
 * @param {string} address - Address to validate
 * @returns {boolean} - True if valid Ethereum address
 */
export const isValidWalletAddress = (address) => {
  return web3Service.isValidAddress(address);
};

/**
 * Validate IPFS hash
 * @param {string} hash - IPFS hash to validate
 * @returns {boolean} - True if valid IPFS hash format
 */
export const isValidIPFSHash = (hash) => {
  if (!hash || typeof hash !== 'string') {
    return false;
  }

  // IPFS hash should be 46 characters and start with 'Qm'
  return hash.length === 46 && hash.startsWith('Qm');
};

/**
 * Validate UUID format
 * @param {string} uuid - UUID to validate
 * @returns {boolean} - True if valid UUID format
 */
export const isValidUUID = (uuid) => {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validate and format VIN
 * @param {string} vin - VIN to validate and format
 * @returns {Object} - { valid: boolean, formatted: string, error: string }
 */
export const validateAndFormatVIN = (vin) => {
  if (!vin) {
    return { valid: false, formatted: '', error: 'VIN is required' };
  }

  const sanitized = vin.replace(/\s+/g, '').toUpperCase();

  if (!isValidVIN(sanitized)) {
    return {
      valid: false,
      formatted: sanitized,
      error: 'Invalid VIN format. Must be 17 alphanumeric characters (excluding I, O, Q)'
    };
  }

  return { valid: true, formatted: sanitized, error: null };
};

/**
 * Validate car data
 * @param {Object} carData - Car data to validate
 * @returns {Object} - { valid: boolean, errors: Array }
 */
export const validateCarData = (carData) => {
  const errors = [];

  // Validate required fields
  if (!carData.vin || !validateAndFormatVIN(carData.vin).valid) {
    errors.push('Valid VIN is required');
  }

  if (!carData.make || carData.make.trim().length === 0) {
    errors.push('Car make is required');
  }

  if (!carData.model || carData.model.trim().length === 0) {
    errors.push('Car model is required');
  }

  if (!isValidYear(carData.year)) {
    errors.push('Valid car year is required (1900 - current year + 2)');
  }

  if (!carData.metadataURI || !isValidIPFSHash(carData.metadataURI)) {
    errors.push('Valid metadata URI is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate user registration data
 * @param {Object} userData - User data to validate
 * @returns {Object} - { valid: boolean, errors: Array }
 */
export const validateUserData = (userData) => {
  const errors = [];

  if (!isValidWalletAddress(userData.walletAddress)) {
    errors.push('Valid wallet address is required');
  }

  if (userData.email && !isValidEmail(userData.email)) {
    errors.push('Valid email format is required');
  }

  if (userData.phone && !isValidPhone(userData.phone)) {
    errors.push('Valid phone number format is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};
