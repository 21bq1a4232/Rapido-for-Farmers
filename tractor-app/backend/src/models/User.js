const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
  },
  name: {
    type: String,
    trim: true,
    default: ''
  },
  role: {
    type: [String],
    enum: ['farmer', 'owner', 'both'],
    default: []
  },
  village: {
    type: String,
    trim: true,
    default: ''
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  language: {
    type: String,
    enum: ['hi', 'en'],
    default: 'hi'
  },
  wallet: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // OTP for authentication
  otp: {
    type: String,
    select: false // Don't include in queries by default
  },
  otpExpiry: {
    type: Date,
    select: false
  },
  // Profile
  profilePhoto: {
    type: String,
    default: ''
  },
  // Additional details
  totalBookingsAsFarmer: {
    type: Number,
    default: 0
  },
  totalBookingsAsOwner: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
userSchema.index({ location: '2dsphere' });

// Create index for phone for faster lookups
userSchema.index({ phone: 1 });

// Method to generate OTP
userSchema.methods.generateOTP = function() {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
  return otp;
};

// Method to verify OTP
userSchema.methods.verifyOTP = function(otp) {
  if (!this.otp || !this.otpExpiry) {
    return false;
  }

  // Check if OTP expired
  if (Date.now() > this.otpExpiry) {
    return false;
  }

  // Check if OTP matches
  return this.otp === otp;
};

// Method to clear OTP after verification
userSchema.methods.clearOTP = function() {
  this.otp = undefined;
  this.otpExpiry = undefined;
};

// Method to update rating
userSchema.methods.updateRating = function(newRating) {
  const totalScore = this.rating * this.totalRatings + newRating;
  this.totalRatings += 1;
  this.rating = totalScore / this.totalRatings;
};

// Virtual for formatted phone number
userSchema.virtual('formattedPhone').get(function() {
  return `+91 ${this.phone}`;
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
