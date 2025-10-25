import axios, { AxiosResponse } from 'axios';
import { API_CONFIG } from '../config/network';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('autotoken_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on unauthorized
      localStorage.removeItem('autotoken_token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

// Authentication API
export const authAPI = {
  generateNonce: (walletAddress: string) =>
    api.post<ApiResponse<{ user: any; nonce: string }>>('/auth/nonce', { walletAddress }),

  login: (walletAddress: string, signature: string, message: string) =>
    api.post<ApiResponse<{ token: string; user: any }>>('/auth/login', {
      walletAddress,
      signature,
      message,
    }),

  refreshToken: (token: string) =>
    api.post<ApiResponse<{ token: string; user: any }>>('/auth/refresh', { token }),

  getProfile: () =>
    api.get<ApiResponse<any>>('/auth/profile'),

  updateProfile: (data: any) =>
    api.put<ApiResponse<any>>('/auth/profile', data),

  logout: () =>
    api.post<ApiResponse<void>>('/auth/logout'),
};

// Cars API
export const carsAPI = {
  createCar: (carData: any, images?: File[]) => {
    const formData = new FormData();

    // Add car data
    Object.keys(carData).forEach(key => {
      formData.append(key, carData[key]);
    });

    // Add images
    if (images) {
      images.forEach((image, index) => {
        formData.append('images', image);
      });
    }

    return api.post<ApiResponse<any>>('/cars', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getUserCars: (params?: any) =>
    api.get<ApiResponse<any[]>>('/cars/my', { params }),

  transferOwnership: (carId: string, newOwnerAddress: string) =>
    api.post<ApiResponse<any>>(`/cars/${carId}/transfer`, { newOwnerAddress }),

  searchCars: (params: any) =>
    api.get<ApiResponse<any[]>>('/cars/search', { params }),

  getCar: (id: string) =>
    api.get<ApiResponse<any>>(`/cars/${id}`),

  updateCar: (id: string, data: any) =>
    api.put<ApiResponse<any>>(`/cars/${id}`, data),

  getCarByTokenId: (tokenId: number) =>
    api.get<ApiResponse<any>>(`/cars/token/${tokenId}`),

  getCarByVin: (vin: string) =>
    api.get<ApiResponse<any>>(`/cars/vin/${vin}`),

  getCarStats: () =>
    api.get<ApiResponse<any>>('/cars/stats'),
};

// Marketplace API
export const marketplaceAPI = {
  createListing: (data: any) =>
    api.post<ApiResponse<any>>('/marketplace/listings', data),

  getListings: (params?: any) =>
    api.get<ApiResponse<any[]>>('/marketplace/listings', { params }),

  getListing: (listingId: number) =>
    api.get<ApiResponse<any>>(`/marketplace/listings/${listingId}`),

  updateListing: (listingId: number, data: any) =>
    api.put<ApiResponse<any>>(`/marketplace/listings/${listingId}`, data),

  cancelListing: (listingId: number) =>
    api.delete<ApiResponse<any>>(`/marketplace/listings/${listingId}`),

  purchaseListing: (listingId: number, data?: any) =>
    api.post<ApiResponse<any>>(`/marketplace/listings/${listingId}/purchase`, data),

  getListingByToken: (tokenId: number) =>
    api.get<ApiResponse<any>>(`/marketplace/listings/token/${tokenId}`),

  getUserListings: (params?: any) =>
    api.get<ApiResponse<any[]>>('/marketplace/my-listings', { params }),

  getStats: () =>
    api.get<ApiResponse<any>>('/marketplace/stats'),
};

// Gasless API
export const gaslessAPI = {
  mintCar: (carData: any, images?: File[]) => {
    const formData = new FormData();

    Object.keys(carData).forEach(key => {
      formData.append(key, carData[key]);
    });

    if (images) {
      images.forEach((image, index) => {
        formData.append('images', image);
      });
    }

    return api.post<ApiResponse<any>>('/gasless/mint', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  listCar: (data: any) =>
    api.post<ApiResponse<any>>('/gasless/list', data),

  purchaseCar: (data: any) =>
    api.post<ApiResponse<any>>('/gasless/purchase', data),

  getTransactions: (params?: any) =>
    api.get<ApiResponse<any[]>>('/gasless/transactions', { params }),

  getTransactionStatus: (txHash: string) =>
    api.get<ApiResponse<any>>(`/gasless/transactions/${txHash}`),

  cancelTransaction: (txHash: string) =>
    api.delete<ApiResponse<any>>(`/gasless/transactions/${txHash}`),

  getStats: () =>
    api.get<ApiResponse<any>>('/gasless/stats'),

  getGasPrice: () =>
    api.get<ApiResponse<{ gasPrice: string; gasPriceEth: string }>>('/gasless/gas-price'),

  estimateGas: (data: any) =>
    api.post<ApiResponse<any>>('/gasless/estimate-gas', data),
};

// Error handler
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors) {
    return error.response.data.errors.join(', ');
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export default api;

