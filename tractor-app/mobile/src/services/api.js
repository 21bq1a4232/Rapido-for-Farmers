import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response.data;
  },
  async (error) => {
    console.log('❌ API Error:', error.config?.url);
    console.log('❌ Error details:', {
      hasResponse: !!error.response,
      hasRequest: !!error.request,
      message: error.message,
    });

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      console.log('❌ Server error:', status, data);

      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
        await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      }

      return Promise.reject({
        status,
        message: data.message || 'An error occurred',
        errors: data.errors,
      });
    } else if (error.request) {
      // Request made but no response
      console.log('❌ No response received from server');
      console.log('❌ Request config:', JSON.stringify(error.config, null, 2));
      return Promise.reject({
        message: 'Network error. Please check your connection.',
      });
    } else {
      // Error in request setup
      console.log('❌ Request setup error:', error.message);
      return Promise.reject({
        message: error.message || 'An error occurred',
      });
    }
  }
);

// ==================== AUTH APIs ====================

export const authAPI = {
  sendOTP: (phone) => api.post('/auth/send-otp', { phone }),

  verifyOTP: (phone, otp) => api.post('/auth/verify-otp', { phone, otp }),

  resendOTP: (phone) => api.post('/auth/resend-otp', { phone }),

  getMe: () => api.get('/auth/me'),
};

// ==================== USER APIs ====================

export const userAPI = {
  getProfile: () => api.get('/auth/me'),

  updateProfile: (data) => api.put('/users/profile', data),

  getUserById: (id) => api.get(`/users/${id}`),

  getWalletBalance: () => api.get('/users/wallet/balance'),

  getUserStats: () => api.get('/users/stats/me'),
};

// ==================== TRACTOR APIs ====================

export const tractorAPI = {
  getAllTractors: (params) => api.get('/tractors', { params }),

  getNearbyTractors: (lat, lng, radius = 10) =>
    api.get('/tractors/nearby', { params: { lat, lng, radius } }),

  getTractorById: (id) => api.get(`/tractors/${id}`),

  createTractor: (data) => api.post('/tractors', data),

  updateTractor: (id, data) => api.put(`/tractors/${id}`, data),

  deleteTractor: (id) => api.delete(`/tractors/${id}`),

  getMyTractors: () => api.get('/tractors/my/tractors'),
};

// ==================== BOOKING APIs ====================

export const bookingAPI = {
  createBooking: (data) => api.post('/bookings', data),

  getMyBookings: (params) => api.get('/bookings', { params }),

  getBookingById: (id) => api.get(`/bookings/${id}`),

  acceptBooking: (id) => api.put(`/bookings/${id}/accept`),

  rejectBooking: (id, reason) =>
    api.put(`/bookings/${id}/reject`, { reason }),

  startBooking: (id, otp) => api.put(`/bookings/${id}/start`, { otp }),

  completeBooking: (id, otp) => api.put(`/bookings/${id}/complete`, { otp }),

  cancelBooking: (id, reason) =>
    api.put(`/bookings/${id}/cancel`, { reason }),

  rateBooking: (id, rating, review) =>
    api.post(`/bookings/${id}/rate`, { rating, review }),

  payForBooking: (id) => api.post(`/payments/bookings/${id}/pay`),
};

// ==================== PAYMENT APIs ====================

export const paymentAPI = {
  addMoneyToWallet: (amount) => api.post('/payments/add-money', { amount }),

  verifyPayment: (razorpayOrderId, razorpayPaymentId, razorpaySignature) =>
    api.post('/payments/verify', {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    }),

  getPaymentHistory: (params) => api.get('/payments/history', { params }),

  getWalletSummary: () => api.get('/payments/wallet/summary'),

  refundBooking: (bookingId, reason) =>
    api.post(`/payments/refund/${bookingId}`, { reason }),
};

// ==================== Helper Functions ====================

export const setAuthToken = async (token) => {
  await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
};

export const removeAuthToken = async () => {
  await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
  await AsyncStorage.removeItem(STORAGE_KEYS.USER);
};

export const saveUser = async (user) => {
  await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const getUser = async () => {
  const user = await AsyncStorage.getItem(STORAGE_KEYS.USER);
  return user ? JSON.parse(user) : null;
};

export default api;
