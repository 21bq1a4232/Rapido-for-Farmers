// User roles
const USER_ROLES = {
  FARMER: 'farmer',
  OWNER: 'owner',
  BOTH: 'both'
};

// Booking statuses
const BOOKING_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Payment statuses
const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  HELD: 'held',
  RELEASED: 'released',
  REFUNDED: 'refunded'
};

// Work types
const WORK_TYPES = {
  PLOWING: 'plowing',
  SOWING: 'sowing',
  HARVESTING: 'harvesting',
  SPRAYING: 'spraying',
  TRANSPORTATION: 'transportation',
  OTHER: 'other'
};

// Platform commission (15%)
const PLATFORM_FEE_PERCENT = 0.15;

// OTP settings
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;

// Geospatial search
const DEFAULT_SEARCH_RADIUS_KM = 10;
const MAX_SEARCH_RADIUS_KM = 50;

// Languages
const LANGUAGES = {
  HINDI: 'hi',
  ENGLISH: 'en'
};

// File upload
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

module.exports = {
  USER_ROLES,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  WORK_TYPES,
  PLATFORM_FEE_PERCENT,
  OTP_LENGTH,
  OTP_EXPIRY_MINUTES,
  DEFAULT_SEARCH_RADIUS_KM,
  MAX_SEARCH_RADIUS_KM,
  LANGUAGES,
  MAX_IMAGE_SIZE,
  ALLOWED_IMAGE_TYPES
};
