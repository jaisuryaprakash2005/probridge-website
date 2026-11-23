const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    type: { type: String, default: 'Full-time', trim: true },
    experience: { type: String, default: '1-3 years', trim: true },
    salary: { type: String, default: 'Competitive', trim: true },
    image: { type: String, default: '', trim: true },
    description: { type: String, default: '' },
    requirements: { type: [String], default: [] },
    openings: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ['active', 'inactive', 'closed'],
      default: 'active',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdByName: { type: String, default: 'Admin' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Career', careerSchema);
