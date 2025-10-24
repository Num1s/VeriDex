import { z } from 'zod';

// Validation schemas using Zod
export const vinSchema = z
  .string()
  .min(17, 'VIN must be 17 characters')
  .max(17, 'VIN must be 17 characters')
  .regex(/^[A-HJ-NPR-Z0-9]+$/i, 'VIN can only contain alphanumeric characters (excluding I, O, Q)');

export const addressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format');

export const priceSchema = z
  .string()
  .refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0 && num < 1000000;
  }, 'Price must be between 0 and 1,000,000 ETH');

export const yearSchema = z
  .number()
  .int('Year must be a whole number')
  .min(1900, 'Year must be 1900 or later')
  .max(new Date().getFullYear() + 2, 'Year cannot be more than 2 years in the future');

export const carSchema = z.object({
  vin: vinSchema,
  make: z.string().min(1, 'Make is required').max(50, 'Make too long'),
  model: z.string().min(1, 'Model is required').max(50, 'Model too long'),
  year: yearSchema,
  color: z.string().max(30, 'Color too long').optional(),
  mileage: z.number().int().min(0, 'Mileage cannot be negative').optional(),
  description: z.string().max(500, 'Description too long').optional(),
});

export const listingSchema = z.object({
  tokenId: z.number().int().min(0, 'Invalid token ID'),
  price: priceSchema,
  description: z.string().max(200, 'Description too long').optional(),
});

export const userProfileSchema = z.object({
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().regex(/^[\+]?[\d\s\-\(\)]+$/, 'Invalid phone format').optional().or(z.literal('')),
  firstName: z.string().max(50, 'First name too long').optional(),
  lastName: z.string().max(50, 'Last name too long').optional(),
});

// Validation functions
export const validateVIN = (vin: string): { valid: boolean; error?: string } => {
  try {
    vinSchema.parse(vin);
    return { valid: true };
  } catch (error) {
    const zodError = error as { errors?: { message: string }[] };
    return { valid: false, error: zodError.errors?.[0]?.message };
  }
};

export const validateAddress = (address: string): { valid: boolean; error?: string } => {
  try {
    addressSchema.parse(address);
    return { valid: true };
  } catch (error) {
    const zodError = error as { errors?: { message: string }[] };
    return { valid: false, error: zodError.errors?.[0]?.message };
  }
};

export const validatePrice = (price: string): { valid: boolean; error?: string } => {
  try {
    priceSchema.parse(price);
    return { valid: true };
  } catch (error) {
    const zodError = error as { errors?: { message: string }[] };
    return { valid: false, error: zodError.errors?.[0]?.message };
  }
};

export const validateYear = (year: number): { valid: boolean; error?: string } => {
  try {
    yearSchema.parse(year);
    return { valid: true };
  } catch (error) {
    const zodError = error as { errors?: { message: string }[] };
    return { valid: false, error: zodError.errors?.[0]?.message };
  }
};

export const validateCarData = (carData: any): { valid: boolean; errors?: Record<string, string> } => {
  try {
    carSchema.parse(carData);
    return { valid: true };
  } catch (error) {
    const errors: Record<string, string> = {};
    const zodError = error as { errors?: { message: string; path: string[] }[] };
    zodError.errors?.forEach((err: any) => {
      const path = err.path.join('.');
      errors[path] = err.message;
    });
    return { valid: false, errors };
  }
};

export const validateListingData = (listingData: any): { valid: boolean; errors?: Record<string, string> } => {
  try {
    listingSchema.parse(listingData);
    return { valid: true };
  } catch (error) {
    const errors: Record<string, string> = {};
    const zodError = error as { errors?: { message: string; path: string[] }[] };
    zodError.errors?.forEach((err: any) => {
      const path = err.path.join('.');
      errors[path] = err.message;
    });
    return { valid: false, errors };
  }
};

export const validateUserProfile = (profileData: any): { valid: boolean; errors?: Record<string, string> } => {
  try {
    userProfileSchema.parse(profileData);
    return { valid: true };
  } catch (error) {
    const errors: Record<string, string> = {};
    const zodError = error as { errors?: { message: string; path: string[] }[] };
    zodError.errors?.forEach((err: any) => {
      const path = err.path.join('.');
      errors[path] = err.message;
    });
    return { valid: false, errors };
  }
};

// Utility validation functions
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidIPFSHash = (hash: string): boolean => {
  return typeof hash === 'string' && hash.length === 46 && hash.startsWith('Qm');
};

