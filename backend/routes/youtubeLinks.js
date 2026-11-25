const express = require('express');
const router = express.Router();
const YoutubeLink = require('../models/YoutubeLink');

const INITIAL_YOUTUBE_LINKS = [
  {
    title: 'Touring Luxury Seaside Villas in ECR Chennai',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Explore breathtaking private seaside villas with Italian marble finish, private pool, and ocean views in Chennai.',
    category: 'Virtual Tours',
    status: 'active',
    order: 1,
  },
  {
    title: 'Top 5 Real Estate Investment Hubs in Bengaluru',
    youtubeUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    description: 'Comprehensive market analysis covering upcoming metro extensions, commercial hubs, and high appreciation residential corridors across Bengaluru.',
    category: 'Market Trends',
    status: 'active',
    order: 2,
  },
  {
    title: 'Modern High-Rise Duplex Penthouse Walkthrough',
    youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    description: 'Walk through an ultra-spacious 4 BHK duplex penthouse featuring smart home automation, open terrace garden, and skyline views.',
    category: 'Walkthrough',
    status: 'active',
    order: 3,
  },
  {
    title: 'Pre-Leased Commercial Assets: 9% Rental Yield Guide',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Understand how institutional investors lock in 9-year corporate leases with multinational banks and tech giants for secure cashflow.',
    category: 'Investment Advice',
    status: 'active',
    order: 4,
  },
];

// Helper to seed initial YouTube links if empty
async function ensureInitialYoutubeLinks() {
  try {
    const count = await YoutubeLink.countDocuments();
    if (count === 0) {
      await YoutubeLink.insertMany(INITIAL_YOUTUBE_LINKS);
    }
  } catch (err) {
    console.warn('[YoutubeLinks Seed Warning]', err.message);
  }
}

// GET /api/youtube-links — List active YouTube links for website spotlight
router.get('/', async (req, res) => {
  try {
    await ensureInitialYoutubeLinks();
    const links = await YoutubeLink.find({ status: 'active' }).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: links.length, results: links });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, results: [] });
  }
});

// GET /api/youtube-links/admin/all — List all for admin dashboard
router.get('/admin/all', async (req, res) => {
  try {
    await ensureInitialYoutubeLinks();
    const links = await YoutubeLink.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: links.length, results: links });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/youtube-links/admin — Create new YouTube spotlight link
router.post('/admin', async (req, res) => {
  try {
    const { title, youtubeUrl, description, category, thumbnail, order, status } = req.body || {};
    if (!title || !youtubeUrl) {
      return res.status(400).json({ success: false, message: 'Title and YouTube URL are required' });
    }

    const newLink = await YoutubeLink.create({
      title: title.trim(),
      youtubeUrl: youtubeUrl.trim(),
      description: (description || '').trim(),
      category: category || 'Virtual Tours',
      thumbnail: (thumbnail || '').trim(),
      order: order ? Number(order) : 0,
      status: status || 'active',
    });

    res.status(201).json({ success: true, result: newLink });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/youtube-links/admin/:id — Update YouTube link
router.patch('/admin/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    const updated = await YoutubeLink.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }
    res.json({ success: true, result: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/youtube-links/admin/:id — Delete YouTube link
router.delete('/admin/:id', async (req, res) => {
  try {
    await YoutubeLink.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
