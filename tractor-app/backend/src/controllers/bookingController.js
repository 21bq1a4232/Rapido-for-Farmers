const Booking = require('../models/Booking');
const Tractor = require('../models/Tractor');
const User = require('../models/User');
const smsService = require('../services/smsService');
const locationService = require('../services/locationService');
const paymentService = require('../services/paymentService');

/**
 * @desc    Create new booking
 * @route   POST /api/bookings
 * @access  Private (Farmer)
 */
exports.createBooking = async (req, res) => {
  try {
    const {
      tractorId,
      startTime,
      duration,
      acres,
      workType,
      workDescription,
      location,
      farmAddress
    } = req.body;

    // Get tractor details
    const tractor = await Tractor.findById(tractorId).populate('owner');

    if (!tractor) {
      return res.status(404).json({
        success: false,
        message: 'Tractor not found'
      });
    }

    if (!tractor.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This tractor is not available'
      });
    }

    const startDate = new Date(startTime);
    const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);

    // Check for booking conflicts
    const conflictingBookings = await Booking.find({
      tractor: tractorId,
      status: { $in: ['pending', 'accepted', 'in-progress'] },
      $or: [
        {
          startTime: { $lte: endDate },
          endTime: { $gte: startDate }
        }
      ]
    });

    if (conflictingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Tractor is already booked for this time period'
      });
    }

    // Calculate total amount
    const totalAmount = tractor.pricePerHour * duration;

    // Create booking
    const booking = await Booking.create({
      farmer: req.user._id,
      tractor: tractorId,
      owner: tractor.owner._id,
      startTime: startDate,
      endTime: endDate,
      duration,
      acres,
      workType,
      workDescription,
      totalAmount,
      location: location || req.user.location,
      farmAddress
    });

    // Generate OTPs
    const startOTP = booking.generateStartOTP();
    const endOTP = booking.generateEndOTP();
    await booking.save();

    // Populate details
    await booking.populate([
      { path: 'tractor', select: 'model brand horsepower' },
      { path: 'owner', select: 'name phone' },
      { path: 'farmer', select: 'name phone' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully. Waiting for owner approval.',
      booking,
      // In development, return OTPs
      ...(process.env.NODE_ENV === 'development' && { startOTP, endOTP })
    });
  } catch (error) {
    console.error('Error in createBooking:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create booking'
    });
  }
};

/**
 * @desc    Get all bookings for current user
 * @route   GET /api/bookings
 * @access  Private
 */
exports.getMyBookings = async (req, res) => {
  try {
    const { status, role } = req.query;

    let query = {};

    // Filter by role
    if (role === 'farmer' || req.user.role.includes('farmer')) {
      query.farmer = req.user._id;
    } else if (role === 'owner' || req.user.role.includes('owner')) {
      query.owner = req.user._id;
    } else {
      // Get both farmer and owner bookings
      query.$or = [
        { farmer: req.user._id },
        { owner: req.user._id }
      ];
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('tractor', 'model brand horsepower pricePerHour')
      .populate('farmer', 'name phone village')
      .populate('owner', 'name phone village')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Error in getMyBookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookings'
    });
  }
};

/**
 * @desc    Get booking by ID
 * @route   GET /api/bookings/:id
 * @access  Private
 */
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('tractor')
      .populate('farmer', 'name phone village rating')
      .populate('owner', 'name phone village rating');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is involved in this booking
    const isInvolved =
      booking.farmer._id.toString() === req.user._id.toString() ||
      booking.owner._id.toString() === req.user._id.toString();

    if (!isInvolved) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Error in getBookingById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get booking'
    });
  }
};

/**
 * @desc    Accept booking (owner only)
 * @route   PUT /api/bookings/:id/accept
 * @access  Private (Owner)
 */
exports.acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('farmer', 'phone name')
      .populate('tractor', 'model');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check ownership
    if (booking.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can accept this booking'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept booking with status: ${booking.status}`
      });
    }

    booking.status = 'accepted';
    await booking.save();

    // Send SMS notification to farmer
    await smsService.sendBookingStatusUpdate(
      booking.farmer.phone,
      'accepted',
      booking._id
    );

    res.status(200).json({
      success: true,
      message: 'Booking accepted successfully',
      booking
    });
  } catch (error) {
    console.error('Error in acceptBooking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept booking'
    });
  }
};

/**
 * @desc    Reject booking (owner only)
 * @route   PUT /api/bookings/:id/reject
 * @access  Private (Owner)
 */
exports.rejectBooking = async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate('farmer', 'phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check ownership
    if (booking.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can reject this booking'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject booking with status: ${booking.status}`
      });
    }

    booking.status = 'rejected';
    booking.cancellationReason = reason;
    booking.cancelledBy = req.user._id;
    booking.cancelledAt = new Date();
    await booking.save();

    // Send SMS notification
    await smsService.sendBookingStatusUpdate(
      booking.farmer.phone,
      'rejected',
      booking._id
    );

    res.status(200).json({
      success: true,
      message: 'Booking rejected',
      booking
    });
  } catch (error) {
    console.error('Error in rejectBooking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject booking'
    });
  }
};

/**
 * @desc    Start booking with OTP
 * @route   PUT /api/bookings/:id/start
 * @access  Private
 */
exports.startBooking = async (req, res) => {
  try {
    const { otp } = req.body;

    const booking = await Booking.findById(req.params.id).select('+otpStart');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Booking must be accepted before starting'
      });
    }

    // Verify OTP
    if (!booking.verifyStartOTP(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    booking.status = 'in-progress';
    booking.actualStartTime = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking started successfully',
      booking
    });
  } catch (error) {
    console.error('Error in startBooking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start booking'
    });
  }
};

/**
 * @desc    Complete booking with OTP
 * @route   PUT /api/bookings/:id/complete
 * @access  Private
 */
exports.completeBooking = async (req, res) => {
  try {
    const { otp } = req.body;

    const booking = await Booking.findById(req.params.id).select('+otpEnd');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'Booking must be in progress to complete'
      });
    }

    // Verify OTP
    if (!booking.verifyEndOTP(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    booking.status = 'completed';
    booking.actualEndTime = new Date();
    await booking.save();

    // Automatically release payment to owner
    let paymentReleased = false;
    if (booking.paymentStatus === 'held') {
      try {
        await paymentService.releasePaymentToOwner(booking._id);
        paymentReleased = true;
      } catch (paymentError) {
        console.error('Error releasing payment:', paymentError);
        // Don't fail the completion if payment release fails
        // Can be retried later
      }
    }

    res.status(200).json({
      success: true,
      message: 'Booking completed successfully. Please rate your experience.',
      booking,
      paymentReleased
    });
  } catch (error) {
    console.error('Error in completeBooking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete booking'
    });
  }
};

/**
 * @desc    Cancel booking
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private
 */
exports.cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const isInvolved =
      booking.farmer.toString() === req.user._id.toString() ||
      booking.owner.toString() === req.user._id.toString();

    if (!isInvolved) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel booking with status: ${booking.status}`
      });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    booking.cancelledBy = req.user._id;
    booking.cancelledAt = new Date();
    await booking.save();

    // Automatically refund if payment was held
    let refundProcessed = false;
    if (booking.paymentStatus === 'held' || booking.paymentStatus === 'paid') {
      try {
        await paymentService.refundBookingPayment(booking._id, reason || 'Booking cancelled');
        refundProcessed = true;
      } catch (refundError) {
        console.error('Error processing refund:', refundError);
        // Don't fail the cancellation if refund fails
        // Can be processed manually later
      }
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking,
      refundProcessed
    });
  } catch (error) {
    console.error('Error in cancelBooking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking'
    });
  }
};

/**
 * @desc    Rate booking after completion
 * @route   POST /api/bookings/:id/rate
 * @access  Private
 */
exports.rateBooking = async (req, res) => {
  try {
    const { rating, review } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate('farmer')
      .populate('owner')
      .populate('tractor');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed bookings'
      });
    }

    const isFarmer = booking.farmer._id.toString() === req.user._id.toString();
    const isOwner = booking.owner._id.toString() === req.user._id.toString();

    if (!isFarmer && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to rate this booking'
      });
    }

    // Update rating
    if (isFarmer) {
      if (booking.ratings.farmerRating) {
        return res.status(400).json({
          success: false,
          message: 'You have already rated this booking'
        });
      }
      booking.ratings.farmerRating = rating;
      booking.ratings.farmerReview = review;

      // Update owner's rating
      booking.owner.updateRating(rating);
      await booking.owner.save();

      // Update tractor rating
      booking.tractor.updateRating(rating);
      await booking.tractor.save();

    } else if (isOwner) {
      if (booking.ratings.ownerRating) {
        return res.status(400).json({
          success: false,
          message: 'You have already rated this booking'
        });
      }
      booking.ratings.ownerRating = rating;
      booking.ratings.ownerReview = review;

      // Update farmer's rating
      booking.farmer.updateRating(rating);
      await booking.farmer.save();
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully',
      booking
    });
  } catch (error) {
    console.error('Error in rateBooking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit rating'
    });
  }
};
