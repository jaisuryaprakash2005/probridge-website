const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    property:         { type: mongoose.Schema.Types.ObjectId, ref: 'Property', default: null },
    propertyTitle:    { type: String, default: '' },
    sender:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    senderName:       { type: String, default: 'Anonymous' },
    senderEmail:      { type: String, default: '' },
    senderPhone:      { type: String, default: '' },
    message:          { type: String, required: true },
    type:             { type: String, default: 'enquiry' },
    requestType:      { type: String, default: 'enquiry' },
    isContactUs:      { type: Boolean, default: false },
    source:           { type: String, default: 'website' },
    subject:          { type: String, default: '' },
    contactUsSubject: { type: String, default: '' },
    status:           { type: String, default: 'New' },
    isRead:           { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Enquiry', enquirySchema);

