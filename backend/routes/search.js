const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const { getLocalitiesByCity, CITY_NAMES } = require('../data/localities');

// GET /api/search?q=&city=
router.get('/', async (req, res) => {
  try {
    const { q = '', city = '' } = req.query;
    const filter = { approvalStatus: 'approved' };
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (q) {
      filter.$or = [
        { title:    { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { locality: { $regex: q, $options: 'i' } },
        { city:     { $regex: q, $options: 'i' } },
      ];
    }
    const properties = await Property.find(filter).sort({ createdAt: -1 }).limit(30);
    res.json({ success: true, properties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/search/cities?q=ch
router.get('/cities', async (req, res) => {
  try {
    const { q = '' } = req.query;
    let dbCities = [];
    try {
      dbCities = await Property.distinct('city', {
        approvalStatus: 'approved',
        city: { $regex: q, $options: 'i', $ne: '' },
      });
    } catch {}

    const staticCities = CITY_NAMES.filter(c => c.toLowerCase().includes(q.toLowerCase()));
    const merged = Array.from(new Set([...dbCities, ...staticCities]));
    res.json({ success: true, cities: merged.slice(0, 15) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/search/localities?city=Chennai&q=an
router.get('/localities', async (req, res) => {
  try {
    const { city = '', q = '' } = req.query;
    const staticLocs = getLocalitiesByCity(city);

    let dbLocs = [];
    try {
      const filter = { approvalStatus: 'approved' };
      if (city) filter.city = { $regex: city, $options: 'i' };
      dbLocs = await Property.distinct('location', filter);
    } catch {}

    const merged = Array.from(new Set([...dbLocs, ...staticLocs]));
    const filtered = q
      ? merged.filter(loc => loc.toLowerCase().includes(q.toLowerCase()))
      : merged;

    res.json({ success: true, localities: filtered.slice(0, 40) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

