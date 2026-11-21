const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Career = require('../models/Career');
const CareerApplication = require('../models/CareerApplication');

const router = express.Router();

// ─── Configure Multer for Resumes (PDF, DOC, DOCX up to 10MB) ───
const storage = multer.memoryStorage();
const uploadResume = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter(req, file, cb) {
    const ext = (file.originalname || '').toLowerCase();
    if (
      ext.endsWith('.pdf') ||
      ext.endsWith('.doc') ||
      ext.endsWith('.docx') ||
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX documents are allowed'));
    }
  },
});

// Cloudinary configuration check
const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
const apiKey = (process.env.CLOUDINARY_API_KEY || '').trim();
const apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();
const isCloudinaryConfigured = Boolean(
  cloudName && apiKey && apiSecret &&
  cloudName !== 'CLOUDINARY_CLOUD_NAME' &&
  apiKey !== 'CLOUDINARY_API_KEY'
);

if (isCloudinaryConfigured) {
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
}

// Upload document as 'raw' resource_type so Cloudinary allows direct public delivery with 200 OK
function uploadBufferToCloudinary(buffer, fileName = 'resume.pdf') {
  return new Promise((resolve, reject) => {
    const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'probridge/resumes',
        resource_type: 'raw',
        public_id: `${Date.now()}-${cleanName}`,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// Generate authorized download URL for any Cloudinary resume (bypasses ACL / 401 on PDFs)
function getAuthorizedResumeUrl(url) {
  if (!url || !isCloudinaryConfigured) return url || '';
  if (typeof url === 'string' && url.includes('cloudinary.com')) {
    try {
      const rawMatch = url.match(/\/raw\/upload\/(?:v\d+\/)?(.+?)(?:\?.*)?$/);
      if (rawMatch) {
        return cloudinary.utils.private_download_url(rawMatch[1], '', {
          resource_type: 'raw',
          type: 'upload',
          expires_at: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days
        });
      }

      const imageMatch = url.match(/\/image\/upload\/(?:v\d+\/)?(.+?)\.([a-zA-Z0-9]+)(?:\?.*)?$/);
      if (imageMatch) {
        return cloudinary.utils.private_download_url(imageMatch[1], imageMatch[2], {
          resource_type: 'image',
          type: 'upload',
          expires_at: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days
        });
      }
    } catch (err) {
      console.warn('[Careers] Could not generate authorized resume URL:', err.message);
    }
  }
  return url;
}

// Default initial careers seed
const INITIAL_CAREERS = [
  {
    title: 'Real Estate Portfolio Advisor',
    department: 'Advisory & Sales',
    location: 'Chennai & Bengaluru',
    type: 'Full-time',
    experience: '2-5 years',
    salary: '₹6L - ₹12L PA + Incentives',
    description: 'Lead high-value property advisory, organize client site visits, and negotiate premium residential deals.',
    requirements: ['2+ years real estate sales', 'Strong communication skills', 'Knowledge of Chennai/Bengaluru market'],
    status: 'active',
  },
  {
    title: 'Frontend React / React Native Engineer',
    department: 'Technology & Product',
    location: 'Remote / Hybrid',
    type: 'Full-time',
    experience: '2-4 years',
    salary: '₹8L - ₹16L PA',
    description: 'Build fast, accessible, responsive web and mobile interfaces for millions of Indian homebuyers.',
    requirements: ['Strong React.js and CSS', 'Experience with REST APIs', 'Attention to UI/UX detail'],
    status: 'active',
  },
  {
    title: 'Property Verification Specialist',
    department: 'Field Operations',
    location: 'Chennai',
    type: 'Full-time',
    experience: '1-3 years',
    salary: '₹4L - ₹7L PA',
    description: 'Conduct on-ground property inspections, legal document vetting, and builder site verifications.',
    requirements: ['Field operations experience', 'Basic legal knowledge of property deeds', 'Valid two-wheeler license'],
    status: 'active',
  },
  {
    title: 'Digital Growth Marketing Manager',
    department: 'Marketing',
    location: 'Bengaluru',
    type: 'Full-time',
    experience: '3-6 years',
    salary: '₹10L - ₹18L PA',
    description: 'Drive organic & paid acquisition, manage social campaigns, and grow ProBridge brand awareness.',
    requirements: ['Proven digital marketing track record', 'SEO/SEM and Meta Ads expertise', 'Data-driven mindset'],
    status: 'active',
  },
];

// Helper to seed initial careers if none exist
async function ensureInitialCareers() {
  try {
    const count = await Career.countDocuments();
    if (count === 0) {
      await Career.insertMany(INITIAL_CAREERS);
      console.log('[Careers] Seeded initial career postings ✅');
    }
  } catch (err) {
    console.warn('[Careers] Seed check skipped:', err.message);
  }
}

// ─────────────────────────────────────────────────────────────
// ADMIN ENDPOINTS (Declared BEFORE wildcard /:id to avoid 404)
// ─────────────────────────────────────────────────────────────

// GET /api/careers/admin/all — List all jobs (including inactive) with application counts
router.get('/admin/all', async (req, res) => {
  try {
    await ensureInitialCareers();
    const careers = await Career.find().sort({ createdAt: -1 }).lean();

    // Attach application counts
    const careersWithCount = await Promise.all(
      careers.map(async (c) => {
        const appCount = await CareerApplication.countDocuments({
          $or: [{ career: c._id }, { roleTitle: c.title }],
        });
        return {
          ...c,
          id: c._id,
          applicationCount: appCount,
        };
      })
    );

    res.json({
      success: true,
      count: careersWithCount.length,
      results: careersWithCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/careers/admin — Admin creates a new career posting
router.post('/admin', async (req, res) => {
  try {
    const {
      title,
      department,
      location,
      type,
      experience,
      salary,
      description,
      requirements,
      openings,
      status,
    } = req.body || {};

    if (!title || !department || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, department, and location are required.',
      });
    }

    let parsedReqs = [];
    if (Array.isArray(requirements)) {
      parsedReqs = requirements.map((r) => String(r).trim()).filter(Boolean);
    } else if (typeof requirements === 'string') {
      parsedReqs = requirements.split('\n').map((r) => r.trim()).filter(Boolean);
    }

    const career = await Career.create({
      title: title.trim(),
      department: department.trim(),
      location: location.trim(),
      type: (type || 'Full-time').trim(),
      experience: (experience || '1-3 years').trim(),
      salary: (salary || 'Competitive').trim(),
      description: (description || '').trim(),
      requirements: parsedReqs,
      openings: openings ? Number(openings) : 1,
      status: status || 'active',
      createdByName: req.user?.name || req.userName || 'Admin',
    });

    res.status(201).json({
      success: true,
      message: 'Career created successfully and is now visible on website',
      result: career,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/careers/admin/:id — Admin updates career
router.patch('/admin/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid career ID' });
    }
    const updates = {};
    const { title, department, location, type, experience, salary, description, requirements, openings, status } = req.body || {};

    if (title !== undefined) updates.title = title.trim();
    if (department !== undefined) updates.department = department.trim();
    if (location !== undefined) updates.location = location.trim();
    if (type !== undefined) updates.type = type.trim();
    if (experience !== undefined) updates.experience = experience.trim();
    if (salary !== undefined) updates.salary = salary.trim();
    if (description !== undefined) updates.description = description.trim();
    if (openings !== undefined) updates.openings = Number(openings);
    if (status !== undefined) updates.status = status;
    if (requirements !== undefined) {
      updates.requirements = Array.isArray(requirements)
        ? requirements.map((r) => String(r).trim()).filter(Boolean)
        : String(requirements).split('\n').map((r) => r.trim()).filter(Boolean);
    }

    const updated = await Career.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Career not found' });

    res.json({ success: true, message: 'Career updated successfully', result: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/careers/admin/:id — Admin deletes career
router.delete('/admin/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid career ID' });
    }
    const deleted = await Career.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Career not found' });
    res.json({ success: true, message: 'Career deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/careers/admin/applications — List all user applications
router.get('/admin/applications', async (req, res) => {
  try {
    const { status, role } = req.query || {};
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (role && role !== 'all') filter.roleTitle = new RegExp(role.trim(), 'i');

    const applications = await CareerApplication.find(filter)
      .sort({ createdAt: -1 })
      .populate('career', 'title department location type')
      .lean();

    const formatted = applications.map((a) => {
      const authorizedResume = getAuthorizedResumeUrl(a.resumeUrl);
      return {
        ...a,
        id: a._id,
        name: a.name || a.fullName || 'Candidate',
        resumeUrl: authorizedResume,
        rawResumeUrl: a.resumeUrl,
      };
    });

    res.json({ success: true, count: formatted.length, results: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/careers/admin/applications/:id/resume — Direct authenticated resume viewer / downloader
router.get('/admin/applications/:id/resume', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send('Invalid application ID');
    }
    const app = await CareerApplication.findById(req.params.id);
    if (!app || !app.resumeUrl) {
      return res.status(404).send('Resume not found');
    }

    const downloadUrl = getAuthorizedResumeUrl(app.resumeUrl);
    if (downloadUrl.startsWith('data:')) {
      const parts = downloadUrl.split(';base64,');
      const contentType = parts[0].replace('data:', '') || 'application/pdf';
      const buffer = Buffer.from(parts[1], 'base64');
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${app.resumeOriginalName || 'resume.pdf'}"`);
      return res.send(buffer);
    }

    return res.redirect(downloadUrl);
  } catch (err) {
    res.status(500).send('Error accessing resume: ' + err.message);
  }
});

// PATCH /api/careers/admin/applications/:id — Update application status or notes
router.patch('/admin/applications/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid application ID' });
    }
    const { status, notes } = req.body || {};
    const updates = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    const updated = await CareerApplication.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Application not found' });

    res.json({ success: true, message: 'Application status updated', result: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/careers/admin/applications/:id — Delete application
router.delete('/admin/applications/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid application ID' });
    }
    const deleted = await CareerApplication.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, message: 'Application deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// PUBLIC ENDPOINTS (For Probridge Website)
// ─────────────────────────────────────────────────────────────

// GET /api/careers — List active careers for website
router.get('/', async (req, res) => {
  try {
    await ensureInitialCareers();
    const careers = await Career.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json({ success: true, count: careers.length, results: careers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/careers/apply — Submit job application from website
router.post('/apply', (req, res, next) => {
  if (req.is('multipart/form-data')) {
    uploadResume.single('resume')(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      next();
    });
  } else {
    next();
  }
}, async (req, res) => {
  try {
    const {
      careerId,
      roleTitle,
      name,
      fullName,
      email,
      phone,
      experience,
      currentCompany,
      currentCtc,
      expectedCtc,
      noticePeriod,
      portfolioUrl,
      linkedInUrl,
      coverLetter,
      message,
    } = req.body || {};

    const applicantName = (name || fullName || '').trim();
    if (!applicantName) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    let finalRoleTitle = roleTitle ? roleTitle.trim() : 'General Application';
    let matchedCareer = null;

    if (careerId && mongoose.Types.ObjectId.isValid(careerId)) {
      matchedCareer = await Career.findById(careerId);
      if (matchedCareer) {
        finalRoleTitle = matchedCareer.title;
      }
    }

    // Handle resume upload
    let resumeUrl = '';
    let resumeOriginalName = '';
    let resumeSize = 0;

    if (req.file) {
      resumeOriginalName = req.file.originalname;
      resumeSize = req.file.size;

      if (isCloudinaryConfigured) {
        try {
          const uploadRes = await uploadBufferToCloudinary(req.file.buffer, req.file.originalname);
          resumeUrl = uploadRes.secure_url || uploadRes.url;
        } catch (uploadErr) {
          console.warn('[Careers] Cloudinary upload failed, storing fallback data URI:', uploadErr.message);
          const base64 = req.file.buffer.toString('base64');
          resumeUrl = `data:${req.file.mimetype};base64,${base64}`;
        }
      } else {
        const base64 = req.file.buffer.toString('base64');
        resumeUrl = `data:${req.file.mimetype};base64,${base64}`;
      }
    } else if (req.body.resumeUrl) {
      resumeUrl = req.body.resumeUrl;
    }

    const application = await CareerApplication.create({
      career: matchedCareer ? matchedCareer._id : null,
      roleTitle: finalRoleTitle,
      name: applicantName,
      fullName: applicantName,
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      experience: (experience || '').trim(),
      currentCompany: (currentCompany || '').trim(),
      currentCtc: (currentCtc || '').trim(),
      expectedCtc: (expectedCtc || '').trim(),
      noticePeriod: (noticePeriod || '').trim(),
      portfolioUrl: (portfolioUrl || '').trim(),
      linkedInUrl: (linkedInUrl || '').trim(),
      coverLetter: (coverLetter || message || '').trim(),
      resumeUrl,
      resumeOriginalName,
      resumeSize,
      status: 'new',
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! Our talent team will review your profile.',
      result: application,
    });
  } catch (err) {
    console.error('[Careers] Error submitting application:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/careers/:id — Single career details (Placed at END so it does NOT intercept /admin routes)
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Career not found' });
    }
    const career = await Career.findById(req.params.id);
    if (!career) return res.status(404).json({ success: false, message: 'Career not found' });
    res.json({ success: true, result: career });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
