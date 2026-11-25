const express = require('express');
const router = express.Router();
const https = require('https');
const http = require('http');
const cloudinary = require('cloudinary').v2;
const BridgeGuide = require('../models/BridgeGuide');

const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
const apiKey = (process.env.CLOUDINARY_API_KEY || '').trim();
const apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

// Helper: extract Cloudinary public_id from raw or upload url
function extractCloudinaryPublicId(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/\/raw\/upload\/(?:s--[^/]+--\/)?(?:v\d+\/)?([^?#]+)/);
  if (match) {
    return decodeURIComponent(match[1]);
  }
  return null;
}

// Helper to get authenticated URL for Cloudinary raw assets
function resolveAuthenticatedPdfUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com') || !url.includes('/raw/upload/')) {
    return url;
  }
  const publicId = extractCloudinaryPublicId(url);
  if (!publicId || !cloudName || !apiKey || !apiSecret) {
    return url;
  }
  try {
    return cloudinary.utils.private_download_url(publicId, 'pdf', {
      resource_type: 'raw',
      type: 'upload',
    });
  } catch (e) {
    console.error('Failed to generate Cloudinary private download URL:', e);
    return url;
  }
}

// GET /api/bridge-guides - Public active bridge guides
router.get('/', async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { status: 'active' };
    const guides = await BridgeGuide.find(filter).sort({ order: 1, createdAt: -1 }).lean();

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const resolvedGuides = guides.map((g) => {
      const isCloudinaryRaw = g.pdfUrl && g.pdfUrl.includes('res.cloudinary.com') && g.pdfUrl.includes('/raw/upload/');
      const authUrl = isCloudinaryRaw ? resolveAuthenticatedPdfUrl(g.pdfUrl) : g.pdfUrl;
      const proxyUrl = `${baseUrl}/api/bridge-guides/file/${g._id}`;

      return {
        ...g,
        pdfUrl: authUrl,
        rawPdfUrl: g.pdfUrl,
        fileUrl: proxyUrl,
        downloadUrl: `${proxyUrl}?download=true`,
      };
    });

    res.json({ success: true, guides: resolvedGuides, results: resolvedGuides });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, guides: [] });
  }
});

// GET /api/bridge-guides/file/:id - Direct PDF stream & download proxy
router.get('/file/:id', async (req, res) => {
  try {
    const guide = await BridgeGuide.findById(req.params.id);
    if (!guide || !guide.pdfUrl) {
      return res.status(404).json({ success: false, error: 'Bridge Guide or PDF not found' });
    }

    const isDownload = req.query.download === 'true';
    const fileName = (guide.fileName || `${guide.title || 'guide'}.pdf`).replace(/[^\w.-]/g, '_');

    // Case 1: Base64 data URI
    if (guide.pdfUrl.startsWith('data:application/pdf;base64,')) {
      const base64Data = guide.pdfUrl.replace(/^data:application\/pdf;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `${isDownload ? 'attachment' : 'inline'}; filename="${fileName}"`);
      res.setHeader('Content-Length', buffer.length);
      return res.send(buffer);
    }

    // Case 2: Cloudinary Raw URL -> Resolve to authenticated URL
    let targetUrl = guide.pdfUrl;
    if (targetUrl.includes('res.cloudinary.com') && targetUrl.includes('/raw/upload/')) {
      targetUrl = resolveAuthenticatedPdfUrl(targetUrl);
    }

    // Pipe / stream targetUrl to client
    const client = targetUrl.startsWith('https') ? https : http;
    client.get(targetUrl, (streamRes) => {
      // Follow redirect if 301/302
      if (streamRes.statusCode >= 300 && streamRes.statusCode < 400 && streamRes.headers.location) {
        const redirectClient = streamRes.headers.location.startsWith('https') ? https : http;
        return redirectClient.get(streamRes.headers.location, (redStreamRes) => {
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `${isDownload ? 'attachment' : 'inline'}; filename="${fileName}"`);
          if (redStreamRes.headers['content-length']) {
            res.setHeader('Content-Length', redStreamRes.headers['content-length']);
          }
          redStreamRes.pipe(res);
        });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `${isDownload ? 'attachment' : 'inline'}; filename="${fileName}"`);
      if (streamRes.headers['content-length']) {
        res.setHeader('Content-Length', streamRes.headers['content-length']);
      }
      streamRes.pipe(res);
    }).on('error', (err) => {
      console.error('[Stream PDF Error]', err);
      res.redirect(targetUrl);
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
