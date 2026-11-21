const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    property:     { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    propertyTitle:{ type: String, default: '' },
    sender:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    senderName:   { type: String, default: 'Anonymous' },
    senderEmail:  { type: String, default: '' },
    senderPhone:  { type: String, default: '' },
    message:      { type: String, required: true },
    isRead:       { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Enquiry', enquirySchema);

