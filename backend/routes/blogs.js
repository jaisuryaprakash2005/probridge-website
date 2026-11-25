const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');

const INITIAL_BLOGS = [
  {
    title: 'Essential Guide to Buying Real Estate in South India: 2026 Edition',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    description: 'The real estate market across Chennai, Bengaluru, and Hyderabad is undergoing unprecedented transformation driven by infrastructure expansion, metro connectivity, and thriving tech corridors. Whether you are a first-time homebuyer or an experienced investor looking to diversify into commercial spaces, understanding legal title verification, RERA compliance, and emerging growth corridors is paramount for long-term capital appreciation.',
    keyfactors: [
      'Strict RERA approval and legal title diligence',
      'Proximity to upcoming metro stations and ring roads',
      'High rental yield potential in IT-centric corridors',
      'Builder track record and construction delivery speed',
      'Transparent documentation and property tax registration',
    ],
    author: 'ProBridge Research Desk',
    category: 'Market Analysis',
    readTime: '6 min read',
    status: 'published',
  },
  {
    title: 'Luxury Sustainable Homes: The Future of Eco-Friendly Urban Living',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    description: 'Modern luxury is no longer solely defined by opulent chandeliers and marble floorings. Discerning homeowners now prioritize IGBC Green Certified constructions, integrated solar power generation, rainwater harvesting systems, and natural cross-ventilation. Developers are responding by blending bioclimatic architecture with high-end lifestyle amenities that minimize carbon footprint without sacrificing aesthetic elegance.',
    keyfactors: [
      'Zero-discharge water treatment and rainwater recycling',
      'Rooftop solar energy grids reducing electricity overheads',
      'Low-VOC paints and locally sourced non-toxic materials',
      'Smart home energy management and automated climate control',
      'Higher resale valuation for certified green developments',
    ],
    author: 'Ananya Sharma',
    category: 'Architecture & Living',
    readTime: '5 min read',
    status: 'published',
  },
  {
    title: 'Commercial vs Residential Real Estate: Which Yields Better ROI?',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    description: 'Deciding between commercial office assets and residential apartments depends heavily on your capital pool, risk tolerance, and investment horizon. While residential investments offer greater liquidity, tax incentives, and lower entry barriers, commercial real estate typically commands rental yields of 7-9% with long-term lease lock-ins and corporate tenants.',
    keyfactors: [
      '7-9% average rental yield on premium commercial properties',
      'Residential properties offer higher liquidity and retail buyer demand',
      'Commercial leases provide longer lock-in periods (3-5 years)',
      'Maintenance responsibilities often borne by commercial tenants',
      'Tax advantages on home loans for residential properties',
    ],
    author: 'Karthik Subramanian',
    category: 'Investment Tips',
    readTime: '7 min read',
    status: 'published',
  },
];

// Helper to seed initial blogs if empty
async function ensureInitialBlogs() {
  try {
    const count = await Blog.countDocuments();
    if (count === 0) {
      await Blog.insertMany(INITIAL_BLOGS);
    }
  } catch (err) {
    console.warn('[Blogs Seed Warning]', err.message);
  }
}

// GET /api/blogs — List published blogs for website
router.get('/', async (req, res) => {
  try {
    await ensureInitialBlogs();
    const { category, search } = req.query;
    const filter = { status: 'published' };
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const blogs = await Blog.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: blogs.length, results: blogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, results: [] });
  }
});

// GET /api/blogs/admin/all — List all blogs for admin dashboard
router.get('/admin/all', async (req, res) => {
  try {
    await ensureInitialBlogs();
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json({ success: true, count: blogs.length, results: blogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/blogs/:id — Get single blog details & increment views
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog article not found' });
    }
    res.json({ success: true, result: blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/blogs/admin — Create new blog article
router.post('/admin', async (req, res) => {
  try {
    const { title, image, description, keyfactors, author, category, readTime, status } = req.body || {};
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    let parsedFactors = [];
    if (Array.isArray(keyfactors)) {
      parsedFactors = keyfactors.map((f) => String(f).trim()).filter(Boolean);
    } else if (typeof keyfactors === 'string') {
      parsedFactors = keyfactors.split('\n').map((f) => f.trim()).filter(Boolean);
    }

    const newBlog = await Blog.create({
      title: title.trim(),
      image: (image || '').trim(),
      description: description.trim(),
      keyfactors: parsedFactors,
      author: (author || 'ProBridge Research Desk').trim(),
      category: category || 'Market Analysis',
      readTime: readTime || '5 min read',
      status: status || 'published',
    });

    res.status(201).json({ success: true, result: newBlog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/blogs/admin/:id — Update blog article
router.patch('/admin/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.keyfactors && typeof updates.keyfactors === 'string') {
      updates.keyfactors = updates.keyfactors.split('\n').map((f) => f.trim()).filter(Boolean);
    }
    const updated = await Blog.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    res.json({ success: true, result: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/blogs/admin/:id — Delete blog
router.delete('/admin/:id', async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
