const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const requireAuth = require('../middleware/requireAuth');

// In-memory saved store (use a SavedProperty model for production)
// For this website we just re-use the same MongoDB collection from the app

const SavedProperty = require('../models/SavedProperty');

// GET /api/saved
router.get('/', requireAuth, async (req, res) => {
  try {
    const saved = await SavedProperty.find({ user: req.user._id }).populate('property');
    const properties = saved.map(s => s.property).filter(Boolean);
    res.json({ success: true, properties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/saved/toggle
router.post('/toggle', requireAuth, async (req, res) => {
  try {
    const { propertyId } = req.body;
    const existing = await SavedProperty.findOne({ user: req.user._id, property: propertyId });
    if (existing) {
      await existing.deleteOne();
      return res.json({ success: true, saved: false });
    }
    await SavedProperty.create({ user: req.user._id, property: propertyId });
    res.json({ success: true, saved: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

