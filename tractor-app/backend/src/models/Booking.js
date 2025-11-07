const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farmer is required']
  },
  tractor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tractor',
    required: [true, 'Tractor is required']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required']
  },
  // Booking time details
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // in hours
    required: [true, 'Duration is required'],
    min: 1
  },
  // Work details
  acres: {
    type: Number,
    min: 0,
    default: 0
  },
  workType: {
    type: String,
    enum: ['plowing', 'sowing', 'harvesting', 'spraying', 'transportation', 'other'],
    default: 'plowing'
  },
  workDescription: {
    type: String,
    maxlength: 300
  },
  // Pricing
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: 0
  },
  platformFee: {
    type: Number,
    default: function() {
      return this.totalAmount * 0.15; // 15% platform fee
    }
  },
  ownerEarnings: {
    type: Number,
    default: function() {
      return this.totalAmount * 0.85; // 85% to owner
    }
  },
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'held', 'released', 'refunded'],
    default: 'pending'
  },
  // OTP for work verification
  otpStart: {
    type: String,
    select: false
  },
  otpEnd: {
    type: String,
    select: false
  },
  // Actual work times
  actualStartTime: {
    type: Date
  },
  actualEndTime: {
    type: Date
  },
  // Location
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
  farmAddress: {
    type: String,
    trim: true
  },
  // Photos for verification
  photos: {
    before: [{
      type: String // URLs to uploaded images
    }],
    after: [{
      type: String
    }]
  },
  // Ratings and reviews
  ratings: {
    farmerRating: {
      type: Number,
      min: 1,
      max: 5
    },
    ownerRating: {
      type: Number,
      min: 1,
      max: 5
    },
    farmerReview: {
      type: String,
      maxlength: 300
    },
    ownerReview: {
      type: String,
      maxlength: 300
    }
  },
  // Cancellation
  cancellationReason: {
    type: String
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: {
    type: Date
  },
  // Additional notes
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Indexes
bookingSchema.index({ farmer: 1, status: 1 });
bookingSchema.index({ owner: 1, status: 1 });
bookingSchema.index({ tractor: 1, startTime: 1 });
bookingSchema.index({ status: 1, paymentStatus: 1 });

// Method to generate OTP for starting work
bookingSchema.methods.generateStartOTP = function() {
  const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
  this.otpStart = otp;
  return otp;
};

// Method to generate OTP for ending work
bookingSchema.methods.generateEndOTP = function() {
  const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
  this.otpEnd = otp;
  return otp;
};

// Method to verify start OTP
bookingSchema.methods.verifyStartOTP = function(otp) {
  return this.otpStart === otp;
};

// Method to verify end OTP
bookingSchema.methods.verifyEndOTP = function(otp) {
  return this.otpEnd === otp;
};

// Method to calculate actual duration
bookingSchema.methods.calculateActualDuration = function() {
  if (this.actualStartTime && this.actualEndTime) {
    const durationMs = this.actualEndTime - this.actualStartTime;
    return Math.round(durationMs / (1000 * 60 * 60)); // Convert to hours
  }
  return this.duration;
};

// Method to check if booking is in valid time range
bookingSchema.methods.isUpcoming = function() {
  return this.startTime > new Date();
};

// Method to check if booking is active
bookingSchema.methods.isActive = function() {
  return this.status === 'in-progress';
};

// Pre-save hook to calculate platform fee and owner earnings
bookingSchema.pre('save', function(next) {
  if (this.isModified('totalAmount')) {
    this.platformFee = Math.round(this.totalAmount * 0.15);
    this.ownerEarnings = Math.round(this.totalAmount * 0.85);
  }
  next();
});

// Virtual to populate farmer details
bookingSchema.virtual('farmerDetails', {
  ref: 'User',
  localField: 'farmer',
  foreignField: '_id',
  justOne: true
});

// Virtual to populate owner details
bookingSchema.virtual('ownerDetails', {
  ref: 'User',
  localField: 'owner',
  foreignField: '_id',
  justOne: true
});

// Virtual to populate tractor details
bookingSchema.virtual('tractorDetails', {
  ref: 'Tractor',
  localField: 'tractor',
  foreignField: '_id',
  justOne: true
});

// Ensure virtuals are included in JSON
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
