const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Enquiry = require('../models/Enquiry');
const Property = require('../models/Property');
const optionalAuth = require('../middleware/optionalAuth');
const requireAuth = require('../middleware/requireAuth');

// Helper to look up property flexibly without crashing on non-ObjectId
async function findProperty(propertyId) {
  if (!propertyId) return null;
  const pid = String(propertyId);
  if (mongoose.Types.ObjectId.isValid(pid)) {
    const p = await Property.findById(pid).catch(() => null);
    if (p) return p;
  }
  const p = await Property.findOne({
    $or: [{ id: pid }, { 'rawFormData.id': pid }],
  }).catch(() => null);
  return p;
}

// POST /api/enquiries — send an enquiry or request callback
router.post('/', optionalAuth, async (req, res) => {
  try {
    const {
      propertyId,
      name,
      senderName,
      email,
      senderEmail,
      phone,
      mobile,
      senderPhone,
      message,
    } = req.body;

    const finalName = name || senderName || req.user?.name || 'Interested Buyer';
    const finalEmail = email || senderEmail || req.user?.email || '';
    const rawPhone = phone || mobile || senderPhone || req.user?.phone || '';
    const finalPhone = String(rawPhone).trim();
    const finalMessage = message || (req.body.isCallback ? 'Request callback' : 'Interested in this property');

    if (!finalPhone && !finalEmail && !finalName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least a contact phone number or email.',
      });
    }

    const property = await findProperty(propertyId);
    const propTitle = property?.title || req.body.propertyTitle || 'Property Listing';
    const propImg = (property?.images && property.images[0]) || property?.image || req.body.propertyImage || '';
    const propIdStr = property ? property._id.toString() : String(propertyId || '');

    const isCallback = Boolean(req.body.isCallback) || (
      typeof finalMessage === 'string' && (
        finalMessage.toLowerCase().includes('callback') || finalMessage.toLowerCase().startsWith('request callback')
      )
    );

    // 1. Save to Notifications collection so Admin Dashboard Leads page displays it immediately
    const notifData = {
      recipient: property?.owner ? String(property.owner) : 'admin',
      recipientEmail: property?.ownerEmail || '',
      sender: req.user?._id ? String(req.user._id) : null,
      senderName: finalName,
      senderEmail: finalEmail,
      senderPhone: finalPhone,
      property: propIdStr,
      propertyId: propIdStr,
      propertyTitle: propTitle,
      propertyImage: propImg,
      type: 'enquiry',
      status: 'New',
      title: isCallback ? `Callback Request: ${propTitle}` : `New Enquiry: ${propTitle}`,
      message: finalMessage,
      read: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      // Insert to uppercase 'Notifications' (used by Admin Dashboard Mongoose model)
      await mongoose.connection.collection('Notifications').insertOne({ ...notifData });
    } catch (notifErr) {
      console.warn('[Enquiry] Could not insert to Notifications collection:', notifErr.message);
    }

    try {
      // Also insert to lowercase 'notifications' if needed
      await mongoose.connection.collection('notifications').insertOne({ ...notifData });
    } catch (lowerErr) {
      // silent fallback
    }

    // 2. Also save to Enquiry collection if valid ObjectId
    let savedEnquiry = null;
    if (property && mongoose.Types.ObjectId.isValid(property._id)) {
      savedEnquiry = await Enquiry.create({
        property: property._id,
        propertyTitle: propTitle,
        sender: req.user?._id || null,
        senderName: finalName,
        senderEmail: finalEmail,
        senderPhone: finalPhone,
        message: finalMessage,
      }).catch(() => null);
    }

    res.status(201).json({
      success: true,
      message: isCallback ? 'Callback request sent successfully' : 'Enquiry sent successfully',
      enquiry: savedEnquiry || notifData,
    });
  } catch (err) {
    console.error('[Enquiry Route Error]', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to submit enquiry' });
  }
});

// GET /api/enquiries/my — owner sees enquiries on their properties
router.get('/my', requireAuth, async (req, res) => {
  try {
    const myProperties = await Property.find({ owner: req.user._id }).select('_id');
    const ids = myProperties.map((p) => p._id);
    const enquiries = await Enquiry.find({ property: { $in: ids } })
      .sort({ createdAt: -1 })
      .populate('property', 'title city');
    res.json({ success: true, enquiries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
