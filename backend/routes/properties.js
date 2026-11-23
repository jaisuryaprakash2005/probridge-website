const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const requireAuth = require('../middleware/requireAuth');
const optionalAuth = require('../middleware/optionalAuth');

// GET /api/properties  — public listing (approved only)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      city, q, localities, listingType, propertyType, buildingType,
      bedroom, minPrice, maxPrice, minArea, maxArea, availability, amenity, status, builder,
      page = 1, limit = 10,
    } = req.query;

    const filter = { approvalStatus: 'approved' };

    // City filter (case-insensitive)
    if (city) filter.city = { $regex: city, $options: 'i' };

    // Multi-locality filter: comma-separated list → $or on location/locality fields
    if (localities) {
      const locArr = localities.split(',').map(l => l.trim()).filter(Boolean);
      if (locArr.length === 1) {
        filter.$or = [
          { location: { $regex: locArr[0], $options: 'i' } },
          { locality: { $regex: locArr[0], $options: 'i' } },
        ];
      } else if (locArr.length > 1) {
        filter.$or = locArr.flatMap(l => [
          { location: { $regex: l, $options: 'i' } },
          { locality: { $regex: l, $options: 'i' } },
        ]);
      }
    } else if (q) {
      // Single keyword / locality search
      filter.$or = [
        { title:    { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { locality: { $regex: q, $options: 'i' } },
        { city:     { $regex: q, $options: 'i' } },
      ];
    }

    // Listing type: Sell | Rent
    if (listingType) filter.listingType = listingType;

    // Property type (supports comma-separated: apartment,villa)
    if (propertyType) filter.propertyType = { $in: propertyType.split(',').map(s => s.trim()) };

    // Building type: Residential | Commercial
    if (buildingType) filter.buildingType = { $regex: buildingType, $options: 'i' };

    // Bedrooms: '1','2','3','4','5+'
    if (bedroom) {
      if (bedroom === '5+') {
        filter.bedroom = { $regex: '^[5-9]|[1-9][0-9]', $options: 'i' };
      } else {
        filter.bedroom = { $regex: `^${bedroom}`, $options: 'i' };
      }
    }

    // Price range
    if (minPrice || maxPrice) {
      const min = minPrice ? Number(minPrice) : 0;
      const max = maxPrice ? Number(maxPrice) : Number.MAX_SAFE_INTEGER;
      const priceCondition = {
        $or: [
          { priceRaw: { ...(minPrice ? { $gte: min } : {}), ...(maxPrice ? { $lte: max } : {}) } },
          { priceRaw: { $in: [0, null] } },
        ],
      };
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, priceCondition];
        delete filter.$or;
      } else {
        filter.$or = priceCondition.$or;
      }
    }

    // Availability / possession status
    if (availability) filter.possession = { $regex: availability, $options: 'i' };

    // Property status: New | Resale
    if (status) filter.status = { $regex: status, $options: 'i' };

    // Builder filter
    if (builder) {
      const bRegex = { $regex: builder, $options: 'i' };
      const builderCond = {
        $or: [
          { builderName: bRegex },
          { 'rawFormData.builderName': bRegex },
          { title: bRegex },
        ],
      };
      if (filter.$and) {
        filter.$and.push(builderCond);
      } else if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, builderCond];
        delete filter.$or;
      } else {
        filter.$or = builderCond.$or;
      }
    }

    // Amenity (single value from filter panel)
    if (amenity) filter.amenities = { $in: [new RegExp(amenity, 'i')] };

    const skip = (Number(page) - 1) * Number(limit);
    const [properties, total] = await Promise.all([
      Property.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('owner', 'name email phone photo'),
      Property.countDocuments(filter),
    ]);

    res.json({ success: true, properties, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/properties/city-counts
router.get('/city-counts', async (req, res) => {
  try {
    const counts = await Property.aggregate([
      { $match: { approvalStatus: 'approved' } },
      {
        $group: {
          _id: { $toLower: { $trim: { input: '$city' } } },
          cityName: { $first: '$city' },
          count: { $sum: 1 },
        },
      },
    ]);
    const result = {};
    counts.forEach(c => {
      if (c.cityName) result[c.cityName.trim()] = c.count;
    });
    res.json({ success: true, counts: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/properties/category-counts
router.get('/category-counts', async (req, res) => {
  try {
    const props = await Property.find({ approvalStatus: 'approved' }, 'propertyType buildingType');
    const counts = { apartment: 0, villa: 0, plot: 0, commercial: 0, independent: 0, pg: 0 };
    props.forEach(p => {
      const t = (p.propertyType || '').toLowerCase();
      const b = (p.buildingType || '').toLowerCase();
      if (t === 'apartment' || t === 'flat') counts.apartment++;
      else if (t === 'villa') counts.villa++;
      else if (t === 'plot' || t === 'land') counts.plot++;
      else if (b === 'commercial' || t === 'commercial') counts.commercial++;
      else if (t === 'independent' || t === 'independent house') counts.independent++;
      else if (t === 'pg' || t === 'pg/hostel') counts.pg++;
    });
    res.json({ success: true, counts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/properties/builder-counts
router.get('/builder-counts', async (req, res) => {
  try {
    const properties = await Property.find({}, 'builderName rawFormData title description status approvalStatus');
    const counts = {};

    // 1. Direct builderName on properties
    properties.forEach((p) => {
      const b = (p.builderName || p.rawFormData?.builderName || '').trim();
      if (b) {
        counts[b] = (counts[b] || 0) + 1;
        counts[b.toLowerCase()] = (counts[b.toLowerCase()] || 0) + 1;
      }
    });

    // 2. Known builder list matching against titles and descriptions
    const KNOWN_BUILDERS = [
      'Brigade Group', 'Puravankara Limited', 'Godrej Properties', 'Shriram Properties',
      'Mahindra Lifespace', 'Provident Housing', 'Prestige Group', 'Tata Value Homes',
      'TVS Emerald', 'Alliance Group', 'XS Real Properties', 'Hiranandani Communities',
      'Lancor Holdings', 'Navins Housing', 'Urbanrise', 'Pacifica Companies',
      'KG Builders', 'Urban Tree Infrastructures', 'Voora Property', 'S&P Foundation',
      'The Nest Builders', 'Nature Residences Development', 'Lakshmi Construction'
    ];

    KNOWN_BUILDERS.forEach((builderFullName) => {
      const bLower = builderFullName.toLowerCase();
      const brandWord = builderFullName.split(' ')[0].toLowerCase();

      let matchCount = 0;
      properties.forEach((p) => {
        const pb = (p.builderName || p.rawFormData?.builderName || '').trim().toLowerCase();
        const pt = (p.title || '').trim().toLowerCase();

        if (pb) {
          if (pb === bLower || pb.includes(bLower) || bLower.includes(pb)) {
            matchCount++;
            return;
          }
          if (brandWord.length >= 4 && pb.includes(brandWord)) {
            matchCount++;
            return;
          }
        }
        if (brandWord.length >= 4 && pt.includes(brandWord)) {
          matchCount++;
          return;
        }
      });

      if (matchCount > (counts[builderFullName] || 0)) {
        counts[builderFullName] = matchCount;
        counts[bLower] = matchCount;
      }
    });

    res.json({ success: true, counts, totalProperties: properties.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/properties/locality-counts
router.get('/locality-counts', async (req, res) => {
  try {
    const properties = await Property.find({}, 'locality city priceRaw price perSqft superArea');
    const locMap = {};

    properties.forEach((p) => {
      const loc = (p.locality || '').trim();
      if (!loc) return;
      const city = (p.city || '').trim();
      const key = city ? `${loc}, ${city}` : loc;

      if (!locMap[key]) {
        locMap[key] = {
          name: loc,
          city: city,
          title: key,
          count: 0,
          prices: [],
          sqftPrices: []
        };
      }
      locMap[key].count += 1;
      if (p.priceRaw) locMap[key].prices.push(Number(p.priceRaw));
      if (p.perSqft) {
        const sqftNum = Number(String(p.perSqft).replace(/[^0-9]/g, ''));
        if (sqftNum > 0) locMap[key].sqftPrices.push(sqftNum);
      }
    });

    const localities = Object.values(locMap).map((loc) => {
      let avgPriceDisplay = 'Price on Request';
      if (loc.sqftPrices.length > 0) {
        const avgSqft = Math.round(loc.sqftPrices.reduce((a, b) => a + b, 0) / loc.sqftPrices.length);
        avgPriceDisplay = `₹ ${avgSqft.toLocaleString('en-IN')}/Sq. Ft`;
      } else if (loc.prices.length > 0) {
        const avgPrice = loc.prices.reduce((a, b) => a + b, 0) / loc.prices.length;
        if (avgPrice >= 10000000) {
          avgPriceDisplay = `₹ ${(avgPrice / 10000000).toFixed(2).replace(/\.00$/, '')} Crore`;
        } else {
          avgPriceDisplay = `₹ ${(avgPrice / 100000).toFixed(1).replace(/\.0$/, '')} Lac`;
        }
      }
      return {
        ...loc,
        avgPriceDisplay
      };
    }).sort((a, b) => b.count - a.count);

    res.json({ success: true, localities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/properties/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email phone photo');
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    // Increment view count
    property.views = (property.views || 0) + 1;
    await property.save();
    res.json({ success: true, property });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/properties  — authenticated users post listings
router.post('/', requireAuth, async (req, res) => {
  try {
    const data = req.body;

    const title = (data.propertyName || data.title || `${data.bedroom || ''} ${data.propertyType || 'Property'} in ${data.locality || data.city || ''}`).trim();
    const location = (data.location || `${data.locality || ''}${data.locality && data.city ? ', ' : ''}${data.city || ''}`).trim();

    // Price parsing
    let formattedPrice = data.price || 'Price on Request';
    let numericPrice = Number(data.priceRaw) || 0;
    const unit = data.priceUnit || 'Lac';

    if (!numericPrice && data.price) {
      const pNum = parseFloat(String(data.price).replace(/[^0-9.]/g, '')) || 0;
      if (unit === 'Cr') numericPrice = Math.round(pNum * 10000000);
      else if (unit === 'Lac') numericPrice = Math.round(pNum * 100000);
      else numericPrice = Math.round(pNum);
    }

    // Images & Cover image (Max 4)
    let images = [];
    if (Array.isArray(data.images) && data.images.length > 0) {
      images = data.images.map((img) => (typeof img === 'string' ? img : img?.url || img?.uri)).filter(Boolean).slice(0, 4);
    }
    let coverImage = data.image || (images.length > 0 ? images[0] : '');
    if (!coverImage) {
      coverImage = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80';
    }
    if (images.length === 0) {
      images = [coverImage];
    }

    // Badges
    const badges = Array.isArray(data.badges) && data.badges.length > 0
      ? data.badges
      : [
          { label: data.propertyType || 'Residential', variant: 'sage', textColor: '#153c35', icon: 'home-variant' },
          { label: data.listingType ? `For ${data.listingType}` : 'For Sale', variant: 'white', textColor: '#2d1e00', icon: 'shield-check' },
        ];

    // Specs
    let specs = Array.isArray(data.specs) && data.specs.length > 0 ? data.specs : [];
    if (specs.length === 0) {
      if (data.propertyType === 'Plot') {
        const pSize = data.plotSize === 'Other' ? (data.customPlotSize || 'Custom') : (data.plotSize || 'Standard');
        specs = [
          { label: 'Plot Type', value: data.plotType || 'Residential' },
          { label: 'Plot Size', value: pSize },
          { label: 'Facing', value: data.roadFacing || 'North' },
          { label: 'Dimension', value: data.plotDimension ? `${data.plotDimension} ${data.plotDimensionUnit || 'Sq. Feet'}` : (data.plotAge ? `${data.plotAge} yrs` : 'New') },
        ];
      } else {
        specs = [
          { label: 'BHK', value: data.bedroom || '2 BHK' },
          { label: 'Baths', value: data.bathroom ? `${data.bathroom} Baths` : '2 Baths' },
          { label: 'Facing', value: data.doorFacing || 'East' },
          { label: 'Furnishing', value: data.furnishingStatus || 'Unfurnished' },
        ];
      }
    }

    const customPlotVal = data.customPlotSize ? String(data.customPlotSize).trim() : '';
    const resolvedPlotSize = (data.propertyType === 'Plot' && data.plotSize === 'Other' && customPlotVal)
      ? customPlotVal
      : data.plotSize;

    const property = await Property.create({
      ...data,
      plotSize: resolvedPlotSize || data.plotSize,
      customPlotSize: customPlotVal || data.customPlotSize,
      title,
      propertyName: data.propertyName || title,
      location,
      price: formattedPrice,
      priceRaw: numericPrice,
      images,
      image: coverImage,
      badges,
      specs,
      owner: req.user._id,
      ownerName: req.user.name,
      ownerEmail: req.user.email,
      ownerPhone: req.user.phone || '',
      phone: data.phone || req.user.phone || '',
      approvalStatus: 'pending',
      status: 'under_review',
    });
    res.status(201).json({ success: true, property });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/properties/my/listings — current user's listings
router.get('/my/listings', requireAuth, async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, properties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/properties/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    if (String(property.owner) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await property.deleteOne();
    res.json({ success: true, message: 'Property deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

