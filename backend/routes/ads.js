const express = require('express');
const router = express.Router();
const Ad = require('../models/Ad');

// GET /api/ads/active — active published ads
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const ads = await Ad.find({
      status: 'published',
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .sort({ publishedAt: -1, createdAt: -1 })
      .populate('property');

    return res.json({ success: true, count: ads.length, results: ads });
  } catch (err) {
    console.error('[Ads Error]', err);
    return res.status(500).json({ success: false, message: err.message, results: [] });
  }
});

// POST /api/ads/:id/click — track ad clicks
router.post('/:id/click', async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      await Ad.findByIdAndUpdate(id, { $inc: { clicks: 1 } });
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

