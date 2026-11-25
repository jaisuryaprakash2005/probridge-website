const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true },
    image: { type: String, default: '', trim: true },
    description: { type: String, required: true, trim: true },
    keyfactors: { type: [String], default: [] },
    author: { type: String, default: 'ProBridge Research Desk', trim: true },
    category: { type: String, default: 'Market Analysis', trim: true },
    readTime: { type: String, default: '5 min read', trim: true },
    status: {
      type: String,
      enum: ['published', 'draft', 'archived'],
      default: 'published',
      index: true,
    },
    views: { type: Number, default: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);
