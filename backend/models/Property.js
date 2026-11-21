const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    owner:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    ownerName:    { type: String, default: 'Property Owner' },
    ownerEmail:   { type: String, default: '' },
    ownerPhone:   { type: String, default: '' },
    phone:        { type: String, default: '' },

    title:        { type: String, required: true, trim: true },
    propertyName: { type: String, default: '' },
    location:     { type: String, required: true },
    city:         { type: String, default: '' },
    locality:     { type: String, default: '' },
    address:      { type: String, default: '' },
    postalCode:   { type: String, default: '' },
    lat:          { type: Number, default: null },
    lng:          { type: Number, default: null },

    price:        { type: String, required: true },
    priceRaw:     { type: Number, default: 0 },
    priceUnit:    { type: String, default: 'Lac' },
    priceNote:    { type: String, default: '' },
    perSqft:      { type: String, default: '' },
    possession:   { type: String, default: 'Ready to Move' },

    buildingType: { type: String, default: 'Residential' },
    listingType:  { type: String, default: 'Sell' },
    propertyType: { type: String, default: 'Apartment' },
    userType:     { type: String, default: 'Owner' },
    propertyAge:  { type: String, default: '' },
    propertyStatus: { type: String, default: '' },

    // Residential specs
    
    unitConfigurations: [
      {
        bhk: { type: String, default: '' },
        area: { type: String, default: '' },
        carpetArea: { type: String, default: '' },
        price: { type: String, default: '' },
        priceNumeric: { type: Number, default: 0 },
        bathrooms: { type: String, default: '' },
        balconies: { type: String, default: '' },
        status: { type: String, default: '' },
      }
    ],
    bedroom:          { type: String, default: '' },
    bathroom:         { type: String, default: '' },
    balconies:        { type: String, default: '' },
    doorFacing:       { type: String, default: '' },
    furnishingStatus: { type: String, default: '' },

    // Plot specs
    plotType:         { type: String, default: '' },
    plotSize:         { type: String, default: '' },
    customPlotSize:   { type: String, default: '' },
    roadFacing:       { type: String, default: '' },
    plotAge:          { type: String, default: '' },
    plotDimension:    { type: String, default: '' },
    plotDimensionUnit:{ type: String, default: 'Sq. Feet' },

    // Floors & Charges
    totalFloors:      { type: String, default: '' },
    selectedFloor:    { type: String, default: '' },
    totalProjectFloors:{ type: String, default: '' },
    possessionDate:   { type: String, default: '' },
    maintenanceCharge:{ type: String, default: '' },
    propertyHighlights:{ type: String, default: '' },
    reraNumber:       { type: String, default: '' },
    builderName:      { type: String, default: '' },
    area:             { type: String, default: '' },

    description: { type: String, default: '' },
    amenities:   [{ type: String }],
    images:      [{ type: String }],
    floorPlanImages: [{ type: String }],
    propertyVideo: { type: String, default: '' },
    propertyBrochure: { type: String, default: '' },
    image:       { type: String, default: '' },

    badges: [{
      label: String,
      icon: String,
      variant: { type: String, default: 'sage' },
      textColor: String,
    }],

    specs: [{
      label: String,
      value: String,
    }],

    secondaryCta: {
      label: { type: String, default: 'Enquire' },
      icon:  { type: String, default: 'phone-outline' },
    },

    views: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['active', 'sold', 'rented', 'inactive', 'under_review', 'approved', 'rejected'],
      default: 'under_review',
      index: true,
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'admin_approved', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    rejectionReason: { type: String, default: '' },
    adminNote:       { type: String, default: '' },
    rawFormData:     { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    collection: 'properties',
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Property', propertySchema, 'properties');




