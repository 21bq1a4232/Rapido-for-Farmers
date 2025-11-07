const User = require('../models/User');
const { generateOTP, getOTPExpiry } = require('../utils/generateOTP');
const smsService = require('./smsService');
const { OTP_LENGTH } = require('../utils/constants');

class OTPService {
  /**
   * Generate and send OTP to user
   * @param {string} phone - Phone number
   * @returns {Promise<object>} Result with success status
   */
  async sendOTP(phone) {
    try {
      // Find or create user
      let user = await User.findOne({ phone }).select('+otp +otpExpiry');

      if (!user) {
        // Create new user if doesn't exist
        user = new User({ phone });
      }

      // Generate OTP
      const otp = generateOTP(OTP_LENGTH);
      user.otp = otp;
      user.otpExpiry = getOTPExpiry(); // 5 minutes from now

      await user.save();

      // Send OTP via SMS
      await smsService.sendOTP(phone, otp);

      return {
        success: true,
        message: 'OTP sent successfully',
        // In development, return OTP for testing (remove in production)
        ...(process.env.NODE_ENV === 'development' && { otp })
      };
    } catch (error) {
      console.error('Error in sendOTP:', error);
      throw new Error('Failed to send OTP');
    }
  }

  /**
   * Verify OTP for a phone number
   * @param {string} phone - Phone number
   * @param {string} otp - OTP to verify
   * @returns {Promise<object>} User object if valid
   */
  async verifyOTP(phone, otp) {
    try {
      const user = await User.findOne({ phone }).select('+otp +otpExpiry');

      if (!user) {
        throw new Error('User not found');
      }

      // Verify OTP using model method
      const isValid = user.verifyOTP(otp);

      if (!isValid) {
        throw new Error('Invalid or expired OTP');
      }

      // Clear OTP after successful verification
      user.clearOTP();
      await user.save();

      return user;
    } catch (error) {
      console.error('Error in verifyOTP:', error);
      throw error;
    }
  }

  /**
   * Resend OTP (with rate limiting check)
   * @param {string} phone - Phone number
   * @returns {Promise<object>} Result
   */
  async resendOTP(phone) {
    try {
      const user = await User.findOne({ phone }).select('+otpExpiry');

      if (user && user.otpExpiry) {
        const timeSinceLastOTP = Date.now() - (user.otpExpiry.getTime() - 5 * 60 * 1000);
        const minResendTime = 60 * 1000; // 1 minute

        if (timeSinceLastOTP < minResendTime) {
          const waitTime = Math.ceil((minResendTime - timeSinceLastOTP) / 1000);
          throw new Error(`Please wait ${waitTime} seconds before requesting a new OTP`);
        }
      }

      // Send new OTP
      return this.sendOTP(phone);
    } catch (error) {
      console.error('Error in resendOTP:', error);
      throw error;
    }
  }
}

module.exports = new OTPService();
