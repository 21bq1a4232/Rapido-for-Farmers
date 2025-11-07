const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * Validation rules for authentication
 */
const authValidation = {
  sendOTP: [
    body('phone')
      .matches(/^[0-9]{10}$/)
      .withMessage('Please provide a valid 10-digit phone number'),
    validate
  ],

  verifyOTP: [
    body('phone')
      .matches(/^[0-9]{10}$/)
      .withMessage('Please provide a valid 10-digit phone number'),
    body('otp')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits'),
    validate
  ]
};

/**
 * Validation rules for user profile
 */
const userValidation = {
  updateProfile: [
    body('name').optional().trim().isLength({ min: 2, max: 50 }),
    body('village').optional().trim().isLength({ max: 100 }),
    body('language').optional().isIn(['hi', 'en']),
    body('role').optional().isArray(),
    validate
  ]
};

/**
 * Validation rules for tractors
 */
const tractorValidation = {
  create: [
    body('model').trim().notEmpty().withMessage('Model is required'),
    body('horsepower').isInt({ min: 10, max: 150 }).withMessage('Horsepower must be between 10 and 150'),
    body('pricePerHour').isFloat({ min: 0 }).withMessage('Price per hour must be a positive number'),
    body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Coordinates must be [longitude, latitude]'),
    validate
  ],

  nearby: [
    query('lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    query('lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    query('radius').optional().isFloat({ min: 1, max: 50 }).withMessage('Radius must be between 1 and 50 km'),
    validate
  ]
};

/**
 * Validation rules for bookings
 */
const bookingValidation = {
  create: [
    body('tractorId').isMongoId().withMessage('Invalid tractor ID'),
    body('startTime').isISO8601().withMessage('Invalid start time'),
    body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 hour'),
    body('workType').optional().isIn(['plowing', 'sowing', 'harvesting', 'spraying', 'transportation', 'other']),
    validate
  ]
};

module.exports = {
  authValidation,
  userValidation,
  tractorValidation,
  bookingValidation
};
