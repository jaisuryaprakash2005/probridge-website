const mongoose = require('mongoose');

const adSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending_approval', 'published', 'rejected', 'archived'],
      default: 'pending_approval',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdByName: { type: String, default: 'Admin' },
    createdByEmail: { type: String, default: '' },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedByName: { type: String, default: '' },
    rejectionReason: { type: String, default: '' },
    publishedAt: { type: Date, default: null },
    clicks: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ad', adSchema);

