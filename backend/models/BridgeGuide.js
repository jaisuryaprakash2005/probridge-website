const mongoose = require('mongoose');

const bridgeGuideSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Guide title is required'],
      trim: true,
    },
    pdfUrl: {
      type: String,
      required: [true, 'PDF file or URL is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    fileName: {
      type: String,
      default: 'document.pdf',
      trim: true,
    },
    fileSize: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      default: 'Buyer Handbook',
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BridgeGuide', bridgeGuideSchema);
