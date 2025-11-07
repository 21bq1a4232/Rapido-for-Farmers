const express = require('express');
const router = express.Router();
const {
  getUserById,
  updateProfile,
  getWalletBalance,
  getUserStats
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { userValidation } = require('../middleware/validation');

// Public routes
router.get('/:id', getUserById);

// Protected routes
router.put('/profile', protect, userValidation.updateProfile, updateProfile);
router.get('/wallet/balance', protect, getWalletBalance);
router.get('/stats/me', protect, getUserStats);

module.exports = router;
