require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const authRoutes       = require('./routes/auth');
const propertyRoutes   = require('./routes/properties');
const searchRoutes     = require('./routes/search');
const filterRoutes     = require('./routes/filters');
const savedRoutes      = require('./routes/saved');
const uploadRoutes     = require('./routes/upload');
const enquiryRoutes    = require('./routes/enquiries');
const adRoutes         = require('./routes/ads');
const careerRoutes     = require('./routes/careers');
const topBannerRoutes  = require('./routes/topBanners');
const builderRoutes    = require('./routes/builders');

const app = express();
const PORT = process.env.PORT || 5001;

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    const allowed = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002',
      'https://jaisuryaprakash2005.github.io',
      process.env.CLIENT_URL,
    ].filter(Boolean);
    if (allowed.includes(origin) || (origin && origin.endsWith('.github.io'))) return callback(null, true);
    // Allow any local network IP (192.168.x.x, 10.x.x.x, 127.0.0.1, localhost) on any port
    if (/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS blocked: ' + origin));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ─── Health check ─────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ success: true, message: 'ProBridge Website API is running 🚀' });
});

// ─── Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/properties',  propertyRoutes);
app.use('/api/search',      searchRoutes);
app.use('/api/filters',     filterRoutes);
app.use('/api/saved',       savedRoutes);
app.use('/api/upload',      uploadRoutes);
app.use('/api/enquiries',   enquiryRoutes);
app.use('/api/ads',         adRoutes);
app.use('/api/careers',     careerRoutes);
app.use('/api/top-banners', topBannerRoutes);
app.use('/api/builders',    builderRoutes);

// ─── 404 ──────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global error handler ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n✅  ProBridge Website API running on http://localhost:${PORT}`);
  });
}

startServer();
module.exports = app;
