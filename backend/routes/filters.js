const express = require('express');
const router = express.Router();

// GET /api/filters
router.get('/', (req, res) => {
  res.json({
    success: true,
    propertyTypes: [
      { id: 'apartment',    label: 'Apartment' },
      { id: 'villa',        label: 'Villa' },
      { id: 'plot',         label: 'Plot / Land' },
      { id: 'commercial',   label: 'Commercial' },
      { id: 'independent',  label: 'Independent House' },
      { id: 'pg',           label: 'PG / Hostel' },
    ],
    listingTypes: [
      { id: 'Sell', label: 'Buy' },
      { id: 'Rent', label: 'Rent' },
    ],
    budgetRanges: [
      { id: '0-2500000',      label: 'Under ₹25 Lakh' },
      { id: '2500000-5000000',label: '₹25L – ₹50L' },
      { id: '5000000-10000000',label: '₹50L – ₹1 Cr' },
      { id: '10000000-20000000',label: '₹1 Cr – ₹2 Cr' },
      { id: '20000000-99999999',label: 'Above ₹2 Cr' },
    ],
  });
});

module.exports = router;

