const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  acceptBooking,
  rejectBooking,
  startBooking,
  completeBooking,
  cancelBooking,
  rateBooking
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');
const { bookingValidation } = require('../middleware/validation');

// All booking routes require authentication
router.use(protect);

// Farmer routes
router.post('/', authorize('farmer', 'both'), bookingValidation.create, createBooking);
router.get('/', getMyBookings);
router.get('/:id', getBookingById);

// Owner routes
router.put('/:id/accept', authorize('owner', 'both'), acceptBooking);
router.put('/:id/reject', authorize('owner', 'both'), rejectBooking);

// Both farmer and owner can perform these
router.put('/:id/start', startBooking);
router.put('/:id/complete', completeBooking);
router.put('/:id/cancel', cancelBooking);
router.post('/:id/rate', rateBooking);

module.exports = router;
