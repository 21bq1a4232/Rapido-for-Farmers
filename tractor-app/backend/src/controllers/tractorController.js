const Tractor = require('../models/Tractor');
const locationService = require('../services/locationService');
const { DEFAULT_SEARCH_RADIUS_KM } = require('../utils/constants');

/**
 * @desc    Create new tractor
 * @route   POST /api/tractors
 * @access  Private (Owner only)
 */
exports.createTractor = async (req, res) => {
  try {
    const {
      model,
      brand,
      horsepower,
      pricePerHour,
      pricePerAcre,
      location,
      address,
      attachments,
      yearOfManufacture,
      fuelType,
      description
    } = req.body;

    // Validate location
    if (!location || !location.coordinates || location.coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Valid location coordinates required [longitude, latitude]'
      });
    }

    const [longitude, latitude] = location.coordinates;
    if (!locationService.isValidCoordinates(latitude, longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }

    const tractor = await Tractor.create({
      owner: req.user._id,
      model,
      brand,
      horsepower,
      pricePerHour,
      pricePerAcre,
      location: locationService.formatLocation(longitude, latitude),
      address,
      attachments,
      yearOfManufacture,
      fuelType,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Tractor created successfully',
      tractor
    });
  } catch (error) {
    console.error('Error in createTractor:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create tractor'
    });
  }
};

/**
 * @desc    Get all tractors (with filters)
 * @route   GET /api/tractors
 * @access  Public
 */
exports.getAllTractors = async (req, res) => {
  try {
    const { minPrice, maxPrice, minHP, maxHP, isActive = true } = req.query;

    const query = { isActive };

    // Price filters
    if (minPrice || maxPrice) {
      query.pricePerHour = {};
      if (minPrice) query.pricePerHour.$gte = Number(minPrice);
      if (maxPrice) query.pricePerHour.$lte = Number(maxPrice);
    }

    // Horsepower filters
    if (minHP || maxHP) {
      query.horsepower = {};
      if (minHP) query.horsepower.$gte = Number(minHP);
      if (maxHP) query.horsepower.$lte = Number(maxHP);
    }

    const tractors = await Tractor.find(query)
      .populate('owner', 'name phone village rating')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: tractors.length,
      tractors
    });
  } catch (error) {
    console.error('Error in getAllTractors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tractors'
    });
  }
};

/**
 * @desc    Get nearby tractors (geospatial search)
 * @route   GET /api/tractors/nearby
 * @access  Public
 */
exports.getNearbyTractors = async (req, res) => {
  try {
    const { lat, lng, radius = DEFAULT_SEARCH_RADIUS_KM } = req.query;

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = parseFloat(radius);

    // Validate coordinates
    if (!locationService.isValidCoordinates(latitude, longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude or longitude'
      });
    }

    // Build geospatial query
    const geoQuery = locationService.buildNearQuery(latitude, longitude, radiusKm);

    const tractors = await Tractor.find({
      ...geoQuery,
      isActive: true
    })
      .populate('owner', 'name phone village rating')
      .limit(50); // Limit to 50 nearest tractors

    // Add distance to each tractor
    const tractorsWithDistance = tractors.map(tractor => {
      const [tractorLng, tractorLat] = tractor.location.coordinates;
      const distance = locationService.calculateDistance(
        latitude,
        longitude,
        tractorLat,
        tractorLng
      );

      return {
        ...tractor.toObject(),
        distance
      };
    });

    // Sort by distance
    tractorsWithDistance.sort((a, b) => a.distance - b.distance);

    res.status(200).json({
      success: true,
      count: tractorsWithDistance.length,
      searchLocation: { latitude, longitude },
      radiusKm,
      tractors: tractorsWithDistance
    });
  } catch (error) {
    console.error('Error in getNearbyTractors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get nearby tractors'
    });
  }
};

/**
 * @desc    Get tractor by ID
 * @route   GET /api/tractors/:id
 * @access  Public
 */
exports.getTractorById = async (req, res) => {
  try {
    const tractor = await Tractor.findById(req.params.id)
      .populate('owner', 'name phone village rating totalRatings isVerified');

    if (!tractor) {
      return res.status(404).json({
        success: false,
        message: 'Tractor not found'
      });
    }

    res.status(200).json({
      success: true,
      tractor
    });
  } catch (error) {
    console.error('Error in getTractorById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tractor'
    });
  }
};

/**
 * @desc    Update tractor
 * @route   PUT /api/tractors/:id
 * @access  Private (Owner only)
 */
exports.updateTractor = async (req, res) => {
  try {
    let tractor = await Tractor.findById(req.params.id);

    if (!tractor) {
      return res.status(404).json({
        success: false,
        message: 'Tractor not found'
      });
    }

    // Check ownership
    if (tractor.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this tractor'
      });
    }

    // Update location if provided
    if (req.body.location && req.body.location.coordinates) {
      const [longitude, latitude] = req.body.location.coordinates;
      if (locationService.isValidCoordinates(latitude, longitude)) {
        req.body.location = locationService.formatLocation(longitude, latitude);
      }
    }

    tractor = await Tractor.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Tractor updated successfully',
      tractor
    });
  } catch (error) {
    console.error('Error in updateTractor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tractor'
    });
  }
};

/**
 * @desc    Delete tractor
 * @route   DELETE /api/tractors/:id
 * @access  Private (Owner only)
 */
exports.deleteTractor = async (req, res) => {
  try {
    const tractor = await Tractor.findById(req.params.id);

    if (!tractor) {
      return res.status(404).json({
        success: false,
        message: 'Tractor not found'
      });
    }

    // Check ownership
    if (tractor.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this tractor'
      });
    }

    // Soft delete: mark as inactive instead of removing
    tractor.isActive = false;
    await tractor.save();

    res.status(200).json({
      success: true,
      message: 'Tractor deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteTractor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete tractor'
    });
  }
};

/**
 * @desc    Get owner's tractors
 * @route   GET /api/tractors/my/tractors
 * @access  Private (Owner only)
 */
exports.getMyTractors = async (req, res) => {
  try {
    const tractors = await Tractor.find({ owner: req.user._id })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: tractors.length,
      tractors
    });
  } catch (error) {
    console.error('Error in getMyTractors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get your tractors'
    });
  }
};
