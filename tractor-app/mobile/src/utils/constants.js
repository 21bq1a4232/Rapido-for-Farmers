// API Configuration
// Using ngrok tunnel for local MacBook development
export const API_BASE_URL = 'https://184d36d35e21.ngrok-free.app/api';

// Colors
export const COLORS = {
  primary: '#2ECC71',
  primaryDark: '#27AE60',
  primaryLight: '#58D68D',
  secondary: '#3498DB',
  background: '#F5F5F5',
  white: '#FFFFFF',
  black: '#000000',
  text: '#2C3E50',
  textLight: '#7F8C8D',
  border: '#BDC3C7',
  error: '#E74C3C',
  warning: '#F39C12',
  success: '#2ECC71',
  danger: '#E74C3C',
  gray: '#95A5A6',
  lightGray: '#ECF0F1',
};

// Fonts
export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  semiBold: 'System',
};

// Sizes
export const SIZES = {
  // Font sizes
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  small: 14,
  tiny: 12,

  // Padding & Margin
  padding: 16,
  margin: 16,
  radius: 12,
  borderRadius: 8,

  // App dimensions
  width: 375,
  height: 812,
};

// User Roles
export const USER_ROLES = {
  FARMER: 'farmer',
  OWNER: 'owner',
  BOTH: 'both',
};

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  HELD: 'held',
  RELEASED: 'released',
  REFUNDED: 'refunded',
};

// Work Types
export const WORK_TYPES = {
  PLOWING: 'plowing',
  SOWING: 'sowing',
  HARVESTING: 'harvesting',
  SPRAYING: 'spraying',
  TRANSPORTATION: 'transportation',
  OTHER: 'other',
};

// Languages
export const LANGUAGES = {
  HINDI: 'hi',
  ENGLISH: 'en',
};

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_LATITUDE: 30.9010,
  DEFAULT_LONGITUDE: 75.8573,
  DEFAULT_DELTA: 0.05,
  SEARCH_RADIUS_KM: 10,
  MAX_SEARCH_RADIUS_KM: 50,
};

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: '@farmshare:token',
  USER: '@farmshare:user',
  LANGUAGE: '@farmshare:language',
};

// Error Messages (will be translated)
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'network_error',
  SERVER_ERROR: 'server_error',
  UNAUTHORIZED: 'unauthorized',
  NOT_FOUND: 'not_found',
  VALIDATION_ERROR: 'validation_error',
};

export default {
  API_BASE_URL,
  COLORS,
  FONTS,
  SIZES,
  USER_ROLES,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  WORK_TYPES,
  LANGUAGES,
  MAP_CONFIG,
  STORAGE_KEYS,
  ERROR_MESSAGES,
};
