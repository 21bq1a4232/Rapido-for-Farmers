const User = require('../models/User');
const locationService = require('../services/locationService');

/**
 * @desc    Get user profile by ID
 * @route   GET /api/users/:id
 * @access  Public
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        village: user.village,
        location: user.location,
        rating: user.rating,
        totalRatings: user.totalRatings,
        isVerified: user.isVerified,
        profilePhoto: user.profilePhoto,
        totalBookingsAsFarmer: user.totalBookingsAsFarmer,
        totalBookingsAsOwner: user.totalBookingsAsOwner
      }
    });
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user'
    });
  }
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, village, language, role, location } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields if provided
    if (name !== undefined) user.name = name;
    if (village !== undefined) user.village = village;
    if (language !== undefined) user.language = language;
    if (role !== undefined) user.role = role;

    // Update location if provided
    if (location && location.latitude !== undefined && location.longitude !== undefined) {
      if (locationService.isValidCoordinates(location.latitude, location.longitude)) {
        user.location = locationService.formatLocation(location.longitude, location.latitude);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinates'
        });
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
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
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

/**
 * @desc    Get current user's wallet balance
 * @route   GET /api/users/wallet
 * @access  Private
 */
exports.getWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('wallet');

    res.status(200).json({
      success: true,
      wallet: user.wallet
    });
  } catch (error) {
    console.error('Error in getWalletBalance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wallet balance'
    });
  }
};

/**
 * @desc    Get user statistics
 * @route   GET /api/users/stats
 * @access  Private
 */
exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      stats: {
        totalBookingsAsFarmer: user.totalBookingsAsFarmer,
        totalBookingsAsOwner: user.totalBookingsAsOwner,
        rating: user.rating,
        totalRatings: user.totalRatings,
        wallet: user.wallet,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Error in getUserStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics'
    });
  }
};
