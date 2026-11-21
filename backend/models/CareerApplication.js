const mongoose = require('mongoose');

const careerApplicationSchema = new mongoose.Schema(
  {
    career: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Career',
      default: null,
      index: true,
    },
    roleTitle: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    fullName: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: '', trim: true },
    experience: { type: String, default: '', trim: true },
    currentCompany: { type: String, default: '', trim: true },
    currentCtc: { type: String, default: '', trim: true },
    expectedCtc: { type: String, default: '', trim: true },
    noticePeriod: { type: String, default: '', trim: true },
    portfolioUrl: { type: String, default: '', trim: true },
    linkedInUrl: { type: String, default: '', trim: true },
    resumeUrl: { type: String, default: '' },
    resumeOriginalName: { type: String, default: '' },
    resumeSize: { type: Number, default: 0 },
    coverLetter: { type: String, default: '' },
    status: {
      type: String,
      enum: ['new', 'pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
      default: 'new',
      index: true,
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Pre-validate hook compatible with both Mongoose 7/8/9 (sync / async) and older Mongoose
careerApplicationSchema.pre('validate', function(next) {
  if (!this.name && this.fullName) {
    this.name = this.fullName;
  }
  if (!this.fullName && this.name) {
    this.fullName = this.name;
  }
  if (this.status === 'pending') {
    this.status = 'new';
  }
  if (typeof next === 'function') {
    return next();
  }
});

module.exports = mongoose.model('CareerApplication', careerApplicationSchema);
