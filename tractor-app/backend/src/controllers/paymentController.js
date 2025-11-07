const paymentService = require('../services/paymentService');

/**
 * @desc    Create order to add money to wallet
 * @route   POST /api/payments/add-money
 * @access  Private
 */
exports.addMoneyToWallet = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum amount is ₹100'
      });
    }

    if (amount > 50000) {
      return res.status(400).json({
        success: false,
        message: 'Maximum amount is ₹50,000 per transaction'
      });
    }

    const order = await paymentService.createWalletOrder(req.user._id, amount);

    res.status(200).json({
      success: true,
      message: 'Payment order created',
      order,
      ...(process.env.RAZORPAY_ENABLED !== 'true' && {
        testMode: true,
        instructions: 'In test mode, use verifyPayment endpoint to simulate successful payment'
      })
    });
  } catch (error) {
    console.error('Error in addMoneyToWallet:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment order'
    });
  }
};

/**
 * @desc    Verify payment and credit wallet
 * @route   POST /api/payments/verify
 * @access  Private
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // In test mode, these fields are optional
    const paymentData = {
      razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId || `pay_test_${Date.now()}`,
      razorpaySignature: razorpaySignature || 'test_signature'
    };

    const result = await paymentService.processWalletPayment(paymentData);

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully. Wallet credited!',
      payment: result.payment,
      user: result.user
    });
  } catch (error) {
    console.error('Error in verifyPayment:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Payment verification failed'
    });
  }
};

/**
 * @desc    Pay for booking from wallet
 * @route   POST /api/bookings/:id/pay
 * @access  Private (Farmer)
 */
exports.payForBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const result = await paymentService.processBookingPayment(req.user._id, bookingId);

    res.status(200).json({
      success: true,
      message: 'Booking payment successful. Amount held in escrow.',
      payment: result.payment,
      booking: result.booking,
      remainingWallet: result.wallet
    });
  } catch (error) {
    console.error('Error in payForBooking:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to process payment'
    });
  }
};

/**
 * @desc    Get payment history
 * @route   GET /api/payments/history
 * @access  Private
 */
exports.getPaymentHistory = async (req, res) => {
  try {
    const { type, status, limit } = req.query;

    const filters = {};
    if (type) filters.type = type;
    if (status) filters.status = status;
    if (limit) filters.limit = parseInt(limit);

    const payments = await paymentService.getPaymentHistory(req.user._id, filters);

    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    console.error('Error in getPaymentHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment history'
    });
  }
};

/**
 * @desc    Get wallet transactions summary
 * @route   GET /api/payments/wallet/summary
 * @access  Private
 */
exports.getWalletSummary = async (req, res) => {
  try {
    const payments = await paymentService.getPaymentHistory(req.user._id);

    // Calculate totals
    const summary = {
      totalCredits: 0,
      totalDebits: 0,
      totalRefunds: 0,
      totalEarnings: 0,
      recentTransactions: payments.slice(0, 10)
    };

    payments.forEach(payment => {
      switch (payment.type) {
        case 'wallet_credit':
          summary.totalCredits += payment.amount;
          break;
        case 'booking_payment':
          summary.totalDebits += payment.amount;
          break;
        case 'booking_refund':
          summary.totalRefunds += payment.amount;
          break;
        case 'owner_payout':
          summary.totalEarnings += payment.amount;
          break;
      }
    });

    res.status(200).json({
      success: true,
      currentBalance: req.user.wallet,
      summary
    });
  } catch (error) {
    console.error('Error in getWalletSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wallet summary'
    });
  }
};

/**
 * @desc    Refund booking (admin/auto on cancellation)
 * @route   POST /api/payments/refund/:bookingId
 * @access  Private
 */
exports.refundBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const result = await paymentService.refundBookingPayment(
      bookingId,
      reason || 'Booking cancelled'
    );

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      refund: result.refund,
      farmerWallet: result.farmerWallet
    });
  } catch (error) {
    console.error('Error in refundBooking:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to process refund'
    });
  }
};
