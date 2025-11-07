const express = require('express');
const router = express.Router();
const {
  addMoneyToWallet,
  verifyPayment,
  payForBooking,
  getPaymentHistory,
  getWalletSummary,
  refundBooking
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// All payment routes require authentication
router.use(protect);

// Wallet management
router.post('/add-money', addMoneyToWallet);
router.post('/verify', verifyPayment);
router.get('/history', getPaymentHistory);
router.get('/wallet/summary', getWalletSummary);

// Booking payments
router.post('/bookings/:id/pay', payForBooking);
router.post('/refund/:bookingId', refundBooking);

module.exports = router;
