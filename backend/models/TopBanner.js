const mongoose = require('mongoose');

const topBannerSchema = new mongoose.Schema(
  {
    title: { type: String, default: '', trim: true },
    subtitle: { type: String, default: '', trim: true },
    image: { type: String, required: true }, // Long width banner image URL
    link: { type: String, default: '', trim: true }, // Optional redirect URL
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null,
    },
    isActive: { type: Boolean, default: true, index: true },
    aspectRatio: { type: Number, default: 4.0 }, // Aspect ratio e.g. 4.0, 3.6, 3.0, 1.78
    order: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    createdByName: { type: String, default: 'Admin' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TopBanner', topBannerSchema);
