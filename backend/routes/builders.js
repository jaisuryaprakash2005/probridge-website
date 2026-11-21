const express = require('express');
const router = express.Router();
const Builder = require('../models/Builder');

const INITIAL_BUILDERS = [
  {
    name: 'Brigade Group',
    logo: 'https://im.proptiger.com/3/100376/13/brigade-9778458.jpeg?height=120&width=320',
    experience: '35+ Years',
    established: '1986',
    headquarters: 'Bengaluru',
    order: 1,
    status: 'active',
  },
  {
    name: 'Puravankara Limited',
    logo: 'https://im.proptiger.com/3/100046/13/puravankara-4491843.jpeg?height=120&width=320',
    experience: '45+ Years',
    established: '1975',
    headquarters: 'Bengaluru',
    order: 2,
    status: 'active',
  },
  {
    name: 'Godrej Properties',
    logo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=320&q=80',
    experience: '32+ Years',
    established: '1990',
    headquarters: 'Mumbai',
    order: 3,
    status: 'active',
  },
  {
    name: 'Prestige Group',
    logo: 'https://im.proptiger.com/3/365/13/prestige-183425.jpg?height=120&width=320',
    experience: '36+ Years',
    established: '1986',
    headquarters: 'Bengaluru',
    order: 4,
    status: 'active',
  },
];

// GET /api/builders — active builders for ProBridge website
router.get('/', async (req, res) => {
  try {
    let count = await Builder.countDocuments();
    if (count === 0) {
      try {
        await Builder.insertMany(INITIAL_BUILDERS);
      } catch (seedErr) {
        console.warn('[Builders Seed Warning]', seedErr.message);
      }
    }

    const builders = await Builder.find({ status: 'active' })
      .sort({ order: 1, createdAt: 1 });

    return res.json({
      success: true,
      count: builders.length,
      results: builders,
    });
  } catch (err) {
    console.error('[Builders Error]', err);
    return res.status(500).json({ success: false, message: err.message, results: [] });
  }
});

// GET /api/builders/:id — single builder details
router.get('/:id', async (req, res) => {
  try {
    const builder = await Builder.findById(req.params.id);
    if (!builder) {
      return res.status(404).json({ success: false, message: 'Builder not found' });
    }
    return res.json({ success: true, result: builder });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
