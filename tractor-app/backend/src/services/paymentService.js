const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Booking = require('../models/Booking');

class PaymentService {
  constructor() {
    this.razorpayEnabled = process.env.RAZORPAY_ENABLED === 'true';

    if (this.razorpayEnabled) {
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET
      });
    }
  }

  /**
   * Create Razorpay order for wallet credit
   * @param {string} userId - User ID
   * @param {number} amount - Amount to add (in rupees)
   * @returns {Promise<object>} Order details
   */
  async createWalletOrder(userId, amount) {
    try {
      const amountInPaise = Math.round(amount * 100);

      if (this.razorpayEnabled) {
        // Create real Razorpay order
        const order = await this.razorpay.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `wallet_${userId}_${Date.now()}`,
          notes: {
            userId,
            type: 'wallet_credit'
          }
        });

        // Create payment record
        await Payment.create({
          user: userId,
          type: 'wallet_credit',
          amount,
          razorpayOrderId: order.id,
          status: 'pending',
          description: `Wallet credit of ₹${amount}`
        });

        return {
          orderId: order.id,
          amount,
          currency: 'INR',
          keyId: process.env.RAZORPAY_KEY_ID
        };
      } else {
        // Test mode: Create mock order
        const mockOrderId = `order_test_${Date.now()}`;

        await Payment.create({
          user: userId,
          type: 'wallet_credit',
          amount,
          razorpayOrderId: mockOrderId,
          status: 'pending',
          description: `[TEST MODE] Wallet credit of ₹${amount}`
        });

        console.log('\n💳 RAZORPAY TEST MODE - Order Created');
        console.log('='.repeat(50));
        console.log(`Order ID: ${mockOrderId}`);
        console.log(`Amount: ₹${amount}`);
        console.log(`User: ${userId}`);
        console.log('='.repeat(50) + '\n');

        return {
          orderId: mockOrderId,
          amount,
          currency: 'INR',
          keyId: 'test_key_id',
          testMode: true
        };
      }
    } catch (error) {
      console.error('Error creating wallet order:', error);
      throw new Error('Failed to create payment order');
    }
  }

  /**
   * Verify Razorpay payment signature
   * @param {object} paymentData - Payment verification data
   * @returns {boolean} True if valid
   */
  verifyPaymentSignature(paymentData) {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = paymentData;

    if (!this.razorpayEnabled) {
      // Test mode: Always return true
      console.log('💳 TEST MODE: Payment signature verification skipped');
      return true;
    }

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const generatedSignature = hmac.digest('hex');

    return generatedSignature === razorpaySignature;
  }

  /**
   * Process successful wallet payment
   * @param {object} paymentData - Payment data
   * @returns {Promise<object>} Updated user and payment
   */
  async processWalletPayment(paymentData) {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = paymentData;

      // Find payment record
      const payment = await Payment.findOne({ razorpayOrderId });

      if (!payment) {
        throw new Error('Payment record not found');
      }

      if (payment.status === 'completed') {
        throw new Error('Payment already processed');
      }

      // Verify signature
      if (!this.verifyPaymentSignature(paymentData)) {
        payment.status = 'failed';
        payment.errorMessage = 'Invalid payment signature';
        await payment.save();
        throw new Error('Payment verification failed');
      }

      // Update payment record
      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature;
      payment.status = 'completed';

      // Get user and update wallet
      const user = await User.findById(payment.user);
      payment.previousBalance = user.wallet;
      payment.newBalance = user.wallet + payment.amount;

      user.wallet += payment.amount;
      await user.save();
      await payment.save();

      console.log(`✅ Wallet credited: ₹${payment.amount} to user ${user.phone}`);

      return {
        success: true,
        payment,
        user: {
          id: user._id,
          wallet: user.wallet
        }
      };
    } catch (error) {
      console.error('Error processing wallet payment:', error);
      throw error;
    }
  }

  /**
   * Process booking payment from wallet
   * @param {string} userId - User ID
   * @param {string} bookingId - Booking ID
   * @returns {Promise<object>} Payment result
   */
  async processBookingPayment(userId, bookingId) {
    try {
      const user = await User.findById(userId);
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.farmer.toString() !== userId) {
        throw new Error('Not authorized to pay for this booking');
      }

      if (booking.paymentStatus === 'paid' || booking.paymentStatus === 'held') {
        throw new Error('Booking already paid');
      }

      // Check wallet balance
      if (user.wallet < booking.totalAmount) {
        throw new Error(`Insufficient balance. Need ₹${booking.totalAmount}, have ₹${user.wallet}`);
      }

      // Deduct from wallet
      const previousBalance = user.wallet;
      user.wallet -= booking.totalAmount;
      await user.save();

      // Create payment record
      const payment = await Payment.create({
        user: userId,
        booking: bookingId,
        type: 'booking_payment',
        amount: booking.totalAmount,
        status: 'completed',
        description: `Payment for booking #${bookingId.toString().slice(-6)}`,
        previousBalance,
        newBalance: user.wallet
      });

      // Update booking payment status to 'held' (escrow)
      booking.paymentStatus = 'held';
      await booking.save();

      console.log(`✅ Booking payment: ₹${booking.totalAmount} held in escrow for booking ${bookingId}`);

      return {
        success: true,
        payment,
        booking,
        wallet: user.wallet
      };
    } catch (error) {
      console.error('Error processing booking payment:', error);
      throw error;
    }
  }

  /**
   * Release payment to owner after booking completion
   * @param {string} bookingId - Booking ID
   * @returns {Promise<object>} Payout result
   */
  async releasePaymentToOwner(bookingId) {
    try {
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.status !== 'completed') {
        throw new Error('Booking must be completed before releasing payment');
      }

      if (booking.paymentStatus === 'released') {
        throw new Error('Payment already released');
      }

      if (booking.paymentStatus !== 'held') {
        throw new Error('Payment not held in escrow');
      }

      // Get owner
      const owner = await User.findById(booking.owner);

      // Credit owner's wallet (85% of total)
      const previousBalance = owner.wallet;
      owner.wallet += booking.ownerEarnings;
      await owner.save();

      // Create payout record
      const payout = await Payment.create({
        user: booking.owner,
        booking: bookingId,
        type: 'owner_payout',
        amount: booking.ownerEarnings,
        status: 'completed',
        description: `Earnings from booking #${bookingId.toString().slice(-6)}`,
        previousBalance,
        newBalance: owner.wallet
      });

      // Update booking payment status
      booking.paymentStatus = 'released';
      await booking.save();

      console.log(`✅ Payment released: ₹${booking.ownerEarnings} to owner ${owner.phone}`);

      return {
        success: true,
        payout,
        ownerWallet: owner.wallet
      };
    } catch (error) {
      console.error('Error releasing payment:', error);
      throw error;
    }
  }

  /**
   * Refund booking payment
   * @param {string} bookingId - Booking ID
   * @param {string} reason - Refund reason
   * @returns {Promise<object>} Refund result
   */
  async refundBookingPayment(bookingId, reason) {
    try {
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.paymentStatus === 'refunded') {
        throw new Error('Booking already refunded');
      }

      if (booking.paymentStatus !== 'held' && booking.paymentStatus !== 'paid') {
        throw new Error('Nothing to refund');
      }

      // Get farmer
      const farmer = await User.findById(booking.farmer);

      // Refund to wallet
      const previousBalance = farmer.wallet;
      farmer.wallet += booking.totalAmount;
      await farmer.save();

      // Create refund record
      const refund = await Payment.create({
        user: booking.farmer,
        booking: bookingId,
        type: 'booking_refund',
        amount: booking.totalAmount,
        status: 'completed',
        description: `Refund for booking #${bookingId.toString().slice(-6)} - ${reason}`,
        previousBalance,
        newBalance: farmer.wallet
      });

      // Update booking
      booking.paymentStatus = 'refunded';
      await booking.save();

      console.log(`✅ Refund processed: ₹${booking.totalAmount} to farmer ${farmer.phone}`);

      return {
        success: true,
        refund,
        farmerWallet: farmer.wallet
      };
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  /**
   * Get payment history for user
   * @param {string} userId - User ID
   * @param {object} filters - Optional filters
   * @returns {Promise<array>} Payment history
   */
  async getPaymentHistory(userId, filters = {}) {
    try {
      const query = { user: userId };

      if (filters.type) {
        query.type = filters.type;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      const payments = await Payment.find(query)
        .populate('booking', 'status totalAmount')
        .sort('-createdAt')
        .limit(filters.limit || 50);

      return payments;
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
