const express = require('express');
const router = express.Router();
const {
  createTractor,
  getAllTractors,
  getNearbyTractors,
  getTractorById,
  updateTractor,
  deleteTractor,
  getMyTractors
} = require('../controllers/tractorController');
const { protect, authorize } = require('../middleware/auth');
const { tractorValidation } = require('../middleware/validation');

// Public routes
router.get('/', getAllTractors);
router.get('/nearby', tractorValidation.nearby, getNearbyTractors);
router.get('/:id', getTractorById);

// Protected routes (owner only)
router.post('/', protect, authorize('owner', 'both'), tractorValidation.create, createTractor);
router.get('/my/tractors', protect, authorize('owner', 'both'), getMyTractors);
router.put('/:id', protect, authorize('owner', 'both'), updateTractor);
router.delete('/:id', protect, authorize('owner', 'both'), deleteTractor);

module.exports = router;
