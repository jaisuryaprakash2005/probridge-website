const mongoose = require('mongoose');

const builderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Builder name is required'],
      trim: true,
      unique: true,
    },
    logo: {
      type: String,
      required: [true, 'Builder logo is required'],
      trim: true,
    },
    experience: {
      type: String,
      default: '',
      trim: true,
    },
    established: {
      type: String,
      default: '',
      trim: true,
    },
    headquarters: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    website: {
      type: String,
      default: '',
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
    createdByName: {
      type: String,
      default: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Builder', builderSchema);
