import { formatEther, formatUnits } from 'viem';

/**
 * Format ETH amount from wei
 * @param wei - Amount in wei
 * @param decimals - Number of decimal places (default: 4)
 * @returns Formatted ETH string
 */
export const formatEth = (wei: bigint | string | number, decimals: number = 4): string => {
  try {
    const value = typeof wei === 'bigint' ? wei : BigInt(wei);
    const ethValue = formatEther(value);
    return parseFloat(ethValue).toFixed(decimals);
  } catch {
    return '0';
  }
};

/**
 * Format address for display
 * @param address - Ethereum address
 * @param chars - Number of characters to show (default: 6)
 * @returns Formatted address string
 */
export const formatAddress = (address: string, chars: number = 6): string => {
  if (!address || address.length < chars * 2) {
    return address;
  }
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

/**
 * Format transaction hash for display
 * @param hash - Transaction hash
 * @param chars - Number of characters to show (default: 6)
 * @returns Formatted hash string
 */
export const formatTxHash = (hash: string, chars: number = 6): string => {
  return formatAddress(hash, chars);
};

/**
 * Format IPFS hash to URL
 * @param hash - IPFS hash
 * @param gateway - IPFS gateway URL (default: pinata)
 * @returns Full IPFS URL
 */
export const formatIPFSUrl = (hash: string, gateway: string = 'https://gateway.pinata.cloud/ipfs/'): string => {
  if (!hash) return '';
  if (hash.startsWith('http')) return hash;
  return `${gateway}${hash.replace('ipfs://', '')}`;
};

/**
 * Format date for display
 * @param date - Date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
): string => {
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', options);
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param date - Date to compare
 * @returns Relative time string
 */
export const formatRelativeTime = (date: Date | string | number): string => {
  try {
    const now = new Date();
    const target = new Date(date);
    const diffMs = now.getTime() - target.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return formatDate(date, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return 'Unknown time';
  }
};

/**
 * Format car display name
 * @param car - Car object
 * @returns Formatted car name
 */
export const formatCarName = (car: { year?: number; make?: string; model?: string }): string => {
  if (!car.make || !car.model) return 'Unknown Car';

  const year = car.year ? `${car.year} ` : '';
  return `${year}${car.make} ${car.model}`;
};

/**
 * Format price with currency
 * @param price - Price amount
 * @param currency - Currency symbol (default: ETH)
 * @returns Formatted price string
 */
export const formatPrice = (price: string | number, currency: string = 'ETH'): string => {
  try {
    const num = parseFloat(price.toString());
    if (isNaN(num)) return '0 ETH';

    if (num >= 1) {
      return `${num.toFixed(2)} ${currency}`;
    } else if (num >= 0.01) {
      return `${num.toFixed(4)} ${currency}`;
    } else {
      return `${num.toFixed(6)} ${currency}`;
    }
  } catch {
    return '0 ETH';
  }
};

/**
 * Format gas cost
 * @param gasUsed - Gas used
 * @param gasPrice - Gas price in wei
 * @returns Formatted gas cost
 */
export const formatGasCost = (gasUsed: string | number, gasPrice: string | number): string => {
  try {
    const used = BigInt(gasUsed.toString());
    const price = BigInt(gasPrice.toString());
    const cost = (used * price) / BigInt('1000000000000000000'); // Convert to ETH

    return formatEth(cost, 6);
  } catch {
    return '0';
  }
};

/**
 * Format file size
 * @param bytes - Size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format VIN for display
 * @param vin - VIN string
 * @returns Formatted VIN
 */
export const formatVIN = (vin: string): string => {
  if (!vin || vin.length !== 17) return vin;
  return vin.toUpperCase();
};

/**
 * Format verification status
 * @param status - Verification status
 * @returns Formatted status with color
 */
export const formatVerificationStatus = (status: string): { text: string; color: string } => {
  switch (status) {
    case 'approved':
      return { text: 'Verified', color: 'text-green-600 bg-green-100' };
    case 'pending':
      return { text: 'Pending', color: 'text-yellow-600 bg-yellow-100' };
    case 'rejected':
      return { text: 'Rejected', color: 'text-red-600 bg-red-100' };
    default:
      return { text: 'Unknown', color: 'text-gray-600 bg-gray-100' };
  }
};

/**
 * Format listing status
 * @param status - Listing status
 * @returns Formatted status with color
 */
export const formatListingStatus = (status: string): { text: string; color: string } => {
  switch (status) {
    case 'active':
      return { text: 'Active', color: 'text-green-600 bg-green-100' };
    case 'sold':
      return { text: 'Sold', color: 'text-blue-600 bg-blue-100' };
    case 'cancelled':
      return { text: 'Cancelled', color: 'text-gray-600 bg-gray-100' };
    case 'expired':
      return { text: 'Expired', color: 'text-red-600 bg-red-100' };
    default:
      return { text: 'Unknown', color: 'text-gray-600 bg-gray-100' };
  }
};

/**
 * Format transaction status
 * @param status - Transaction status
 * @returns Formatted status with color
 */
export const formatTransactionStatus = (status: string): { text: string; color: string } => {
  switch (status) {
    case 'confirmed':
      return { text: 'Confirmed', color: 'text-green-600 bg-green-100' };
    case 'pending':
      return { text: 'Pending', color: 'text-yellow-600 bg-yellow-100' };
    case 'failed':
      return { text: 'Failed', color: 'text-red-600 bg-red-100' };
    case 'cancelled':
      return { text: 'Cancelled', color: 'text-gray-600 bg-gray-100' };
    default:
      return { text: 'Unknown', color: 'text-gray-600 bg-gray-100' };
  }
};

/**
 * Format number with commas
 * @param num - Number to format
 * @returns Formatted number string
 */
export const formatNumber = (num: number | string): string => {
  return new Intl.NumberFormat('en-US').format(Number(num));
};

/**
 * Truncate text to specified length
 * @param text - Text to truncate
 * @param length - Maximum length
 * @returns Truncated text
 */
export const truncateText = (text: string, length: number = 50): string => {
  if (!text || text.length <= length) return text;
  return text.slice(0, length) + '...';
};

