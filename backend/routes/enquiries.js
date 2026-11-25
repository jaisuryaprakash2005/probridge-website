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

    const isContactUs = Boolean(req.body.isContactUs) ||
      req.body.source === 'contact_us' ||
      req.body.requestType === 'contact_us' ||
      req.body.type === 'contact_us' ||
      !propertyId;

    // Strict limit: One account / user can only submit Contact Us once
    if (isContactUs) {
      const orClauses = [];
      if (req.user?._id) orClauses.push({ sender: req.user._id });
      if (finalPhone) orClauses.push({ senderPhone: finalPhone });
      if (finalEmail) orClauses.push({ senderEmail: finalEmail });

      if (orClauses.length > 0) {
        const existing = await Enquiry.findOne({
          isContactUs: true,
          $or: orClauses,
        }).catch(() => null);

        if (existing) {
          return res.status(200).json({
            success: true,
            alreadySubmitted: true,
            message: 'You have already submitted an inquiry to ProBridge. Our team will contact you shortly.',
            enquiry: existing,
          });
        }
      }
    }

    const property = await findProperty(propertyId);
    const propTitle = isContactUs
      ? 'Contact Us Submission'
      : (property?.title || req.body.propertyTitle || 'Property Listing');
    const propImg = (property?.images && property.images[0]) || property?.image || req.body.propertyImage || '';
    const propIdStr = property ? property._id.toString() : (isContactUs ? '' : String(propertyId || ''));

    const isCallback = !isContactUs && (Boolean(req.body.isCallback) || (
      typeof finalMessage === 'string' && (
        finalMessage.toLowerCase().includes('callback') || finalMessage.toLowerCase().startsWith('request callback')
      )
    ));

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
      type: isContactUs ? 'contact_us' : (isCallback ? 'callback' : 'enquiry'),
      requestType: isContactUs ? 'contact_us' : (isCallback ? 'callback' : 'enquiry'),
      isContactUs: isContactUs,
      source: isContactUs ? 'contact_us' : 'website',
      status: 'New',
      title: isContactUs
        ? `Contact Us Message from ${finalName}`
        : (isCallback ? `Callback Request: ${propTitle}` : `New Enquiry: ${propTitle}`),
      subject: req.body.subject || (isContactUs ? 'Website Contact Inquiry' : ''),
      contactUsSubject: req.body.contactUsSubject || req.body.subject || (isContactUs ? 'Website Contact Inquiry' : ''),
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

    // 2. Also save to Enquiry collection
    let savedEnquiry = null;
    try {
      savedEnquiry = await Enquiry.create({
        property: property && mongoose.Types.ObjectId.isValid(property._id) ? property._id : null,
        propertyTitle: propTitle,
        sender: req.user?._id || null,
        senderName: finalName,
        senderEmail: finalEmail,
        senderPhone: finalPhone,
        message: finalMessage,
        type: isContactUs ? 'contact_us' : 'enquiry',
        requestType: isContactUs ? 'contact_us' : 'enquiry',
        isContactUs: isContactUs,
        source: isContactUs ? 'contact_us' : 'website',
        subject: req.body.subject || (isContactUs ? 'Website Contact Inquiry' : ''),
        contactUsSubject: req.body.contactUsSubject || req.body.subject || (isContactUs ? 'Website Contact Inquiry' : ''),
      });
    } catch (enqErr) {
      console.warn('[Enquiry Save Warning]', enqErr.message);
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

// GET /api/enquiries/contact-status — check if user/account has already submitted Contact Us
router.get('/contact-status', optionalAuth, async (req, res) => {
  try {
    const { phone, email } = req.query;
    const orClauses = [];
    if (req.user?._id) orClauses.push({ sender: req.user._id });
    if (req.user?.phone) orClauses.push({ senderPhone: req.user.phone });
    if (req.user?.email) orClauses.push({ senderEmail: req.user.email });
    if (phone) orClauses.push({ senderPhone: String(phone).trim() });
    if (email) orClauses.push({ senderEmail: String(email).trim() });

    if (orClauses.length === 0) {
      return res.json({ success: true, submitted: false });
    }

    const existing = await Enquiry.findOne({
      isContactUs: true,
      $or: orClauses,
    }).catch(() => null);

    return res.json({
      success: true,
      submitted: Boolean(existing),
      enquiry: existing || null,
    });
  } catch (err) {
    return res.json({ success: true, submitted: false });
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
