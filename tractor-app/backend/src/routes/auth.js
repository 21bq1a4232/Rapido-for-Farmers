const express = require('express');
const router = express.Router();
const {
  sendOTP,
  verifyOTP,
  resendOTP,
  getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authValidation } = require('../middleware/validation');

// Public routes
router.post('/send-otp', authValidation.sendOTP, sendOTP);
router.post('/verify-otp', authValidation.verifyOTP, verifyOTP);
router.post('/resend-otp', authValidation.sendOTP, resendOTP);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
