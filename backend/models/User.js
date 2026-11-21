const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      default: '',
    },
    photo: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'superadmin'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['trusted', 'flagged', 'restricted', 'revoked'],
      default: 'trusted',
      index: true,
    },
    statusReason: {
      type: String,
      default: '',
    },
    statusUpdatedAt: {
      type: Date,
      default: null,
    },
    provider: {
      type: String,
      enum: ['email', 'google', 'phone'],
      default: 'email',
    },
    googleId: {
      type: String,
      default: null,
    },
    databaseName: {
      type: String,
      default: '',
    },
    savedProperties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
      },
    ],
  },
  {
    collection: 'User Details',
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('User', userSchema, 'User Details');
