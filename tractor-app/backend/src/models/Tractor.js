const mongoose = require('mongoose');

const tractorSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required']
  },
  model: {
    type: String,
    required: [true, 'Tractor model is required'],
    trim: true
  },
  brand: {
    type: String,
    trim: true,
    default: ''
  },
  horsepower: {
    type: Number,
    required: [true, 'Horsepower is required'],
    min: 10,
    max: 150
  },
  pricePerHour: {
    type: Number,
    required: [true, 'Price per hour is required'],
    min: 0
  },
  pricePerAcre: {
    type: Number,
    default: 0,
    min: 0
  },
  images: [{
    type: String // URLs to uploaded images
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  // Availability calendar
  availability: [{
    date: {
      type: Date,
      required: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  // Attachments/implements available
  attachments: [{
    type: String,
    enum: ['plow', 'harrow', 'cultivator', 'seeder', 'sprayer', 'trailer', 'rotavator', 'other']
  }],
  // Rating and reviews
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
  totalBookings: {
    type: Number,
    default: 0
  },
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // Additional details
  yearOfManufacture: {
    type: Number,
    min: 1950,
    max: new Date().getFullYear()
  },
  fuelType: {
    type: String,
    enum: ['diesel', 'petrol', 'electric'],
    default: 'diesel'
  },
  description: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
tractorSchema.index({ location: '2dsphere' });

// Create compound index for active tractors
tractorSchema.index({ isActive: 1, isVerified: 1 });

// Create index for owner
tractorSchema.index({ owner: 1 });

// Method to check availability for a specific date range
tractorSchema.methods.checkAvailability = function(startDate, endDate) {
  // Check if there are any unavailable dates in the range
  const unavailableDates = this.availability.filter(a => {
    const aDate = new Date(a.date);
    return aDate >= startDate && aDate <= endDate && !a.isAvailable;
  });

  return unavailableDates.length === 0;
};

// Method to block dates (mark as unavailable)
tractorSchema.methods.blockDates = function(startDate, endDate) {
  const dates = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    dates.push({
      date: new Date(current),
      isAvailable: false
    });
    current.setDate(current.getDate() + 1);
  }

  this.availability.push(...dates);
};

// Method to update rating
tractorSchema.methods.updateRating = function(newRating) {
  const totalScore = this.rating * this.totalRatings + newRating;
  this.totalRatings += 1;
  this.rating = totalScore / this.totalRatings;
  this.totalBookings += 1;
};

// Virtual to get distance (to be set dynamically in queries)
tractorSchema.virtual('distance').get(function() {
  return this._distance;
});

// Virtual for owner details
tractorSchema.virtual('ownerDetails', {
  ref: 'User',
  localField: 'owner',
  foreignField: '_id',
  justOne: true
});

// Ensure virtuals are included in JSON
tractorSchema.set('toJSON', { virtuals: true });
tractorSchema.set('toObject', { virtuals: true });

const Tractor = mongoose.model('Tractor', tractorSchema);

module.exports = Tractor;
