const express = require('express');
const router = express.Router();
const TopBanner = require('../models/TopBanner');

// GET /api/top-banners — active top banners for ProBridge website
router.get('/', async (req, res) => {
  try {
    const banners = await TopBanner.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .populate('property', 'title price location image city locality buildingType');
    return res.json({ success: true, count: banners.length, results: banners });
  } catch (err) {
    console.error('[TopBanners Error]', err);
    return res.status(500).json({ success: false, message: err.message, results: [] });
  }
});

// POST /api/top-banners/:id/click — track clicks
router.post('/:id/click', async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      await TopBanner.findByIdAndUpdate(id, { $inc: { clicks: 1 } });
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
