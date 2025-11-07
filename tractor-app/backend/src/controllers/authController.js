const otpService = require('../services/otpService');
const { generateToken } = require('../middleware/auth');

/**
 * @desc    Send OTP to phone number
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
exports.sendOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;

    const result = await otpService.sendOTP(phone);

    res.status(200).json({
      success: true,
      message: result.message,
      // In development, include OTP in response for easier testing
      ...(process.env.NODE_ENV === 'development' && result.otp && { otp: result.otp })
    });
  } catch (error) {
    console.error('Error in sendOTP controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send OTP'
    });
  }
};

/**
 * @desc    Verify OTP and login user
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
exports.verifyOTP = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    const user = await otpService.verifyOTP(phone, otp);

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        village: user.village,
        language: user.language,
        wallet: user.wallet,
        rating: user.rating,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Error in verifyOTP controller:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Invalid OTP'
    });
  }
};

/**
 * @desc    Resend OTP
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
exports.resendOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;

    const result = await otpService.resendOTP(phone);

    res.status(200).json({
      success: true,
      message: result.message,
      ...(process.env.NODE_ENV === 'development' && result.otp && { otp: result.otp })
    });
  } catch (error) {
    console.error('Error in resendOTP controller:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to resend OTP'
    });
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        village: user.village,
        location: user.location,
        language: user.language,
        wallet: user.wallet,
        rating: user.rating,
        totalRatings: user.totalRatings,
        isVerified: user.isVerified,
        profilePhoto: user.profilePhoto,
        totalBookingsAsFarmer: user.totalBookingsAsFarmer,
        totalBookingsAsOwner: user.totalBookingsAsOwner
      }
    });
  } catch (error) {
    console.error('Error in getMe controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data'
    });
  }
};
