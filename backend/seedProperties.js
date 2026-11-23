require('dotenv').config();
const { connectDB } = require('./config/db');
const Property = require('./models/Property');

const DUMMY_PROPERTIES = [
  {
    title: 'Godrej Azure - Sea Facing Luxury High-Rise Residences',
    propertyName: 'Godrej Azure',
    builderName: 'Godrej Properties',
    location: 'Padur, OMR IT Expressway, Chennai',
    locality: 'Padur',
    city: 'Chennai',
    state: 'Tamil Nadu',
    address: 'Survey No. 142/1, Rajiv Gandhi Salai (OMR), Padur, Chennai, Tamil Nadu 603103',
    postalCode: '603103',
    lat: 12.8124,
    lng: 80.2289,

    price: '₹ 82.5 Lac - 1.65 Cr',
    priceRaw: 8250000,
    priceUnit: 'Lac',
    priceNote: 'Govt. charges & registration extra',
    perSqft: '₹ 6,600 / sq.ft',
    possession: 'Ready to Move',
    possessionDate: 'December 2026',
    propertyStatus: 'Ready to Move',
    propertyAge: '0-1 Year (Brand New Construction)',

    buildingType: 'Residential',
    listingType: 'Sell',
    propertyType: 'Apartment',
    userType: 'Builder',

    bedroom: '2, 3 & 4 BHK',
    bathroom: '2 - 4 Bathrooms',
    balconies: '2 - 3 Balconies',
    doorFacing: 'North-East',
    furnishingStatus: 'Semi-Furnished with Modular Kitchen & Wardrobes',
    totalFloors: '18 Floors',
    selectedFloor: '7th to 15th Floors Available',
    totalProjectFloors: '18',
    maintenanceCharge: '₹ 3.50 / sq.ft / month',
    reraNumber: 'TN/01/Building/0042/2026',

    propertyHighlights: 'Panoramic Bay of Bengal ocean views • 30,000 sq.ft luxury club • IGBC Gold certified green building • 2 mins from upcoming Metro',
    description: 'Godrej Azure offers spectacular panoramic views of the Bay of Bengal and lush greenery along Chennai’s prime IT corridor on OMR. Designed with energy-efficient green architecture, every residence features expansive cross-ventilated balconies, double-glazed soundproof glass, imported marble flooring, and pre-fitted modular kitchens. Residents enjoy over 30 modern lifestyle amenities, a grand 3-tier clubhouse, an infinity swimming pool, and dedicated multi-tier security.',

    unitConfigurations: [
      {
        bhk: '2 BHK Luxury',
        area: '1,250 sq.ft',
        carpetArea: '940 sq.ft',
        price: '₹ 82.50 Lac',
        priceNumeric: 8250000,
        bathrooms: '2',
        balconies: '2',
        status: 'Ready to Move'
      },
      {
        bhk: '3 BHK Premium',
        area: '1,680 sq.ft',
        carpetArea: '1,260 sq.ft',
        price: '₹ 1.15 Cr',
        priceNumeric: 11500000,
        bathrooms: '3',
        balconies: '2',
        status: 'Ready to Move'
      },
      {
        bhk: '3 BHK Royale + Study',
        area: '1,950 sq.ft',
        carpetArea: '1,480 sq.ft',
        price: '₹ 1.38 Cr',
        priceNumeric: 13800000,
        bathrooms: '3',
        balconies: '3',
        status: 'Ready to Move'
      },
      {
        bhk: '4 BHK Sky Villa',
        area: '2,550 sq.ft',
        carpetArea: '1,980 sq.ft',
        price: '₹ 1.85 Cr',
        priceNumeric: 18500000,
        bathrooms: '4',
        balconies: '4',
        status: 'Ready to Move'
      }
    ],

    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80'
    ],

    floorPlanImages: [
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=900&q=80',
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=900&q=80',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=900&q=80'
    ],

    propertyVideo: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    propertyBrochure: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',

    amenities: [
      'Swimming Pool & Kids Splash Pool',
      'State-of-the-art Gymnasium',
      'Clubhouse & Banquet Hall',
      'Landscaped Gardens & Reflexology Park',
      'Children Play Area & Creche',
      '24/7 Power Backup & Solar Lighting',
      'Multi-tier CCTV Security & Gated Community',
      'Covered Reserved Car Parking',
      'High-Speed Automatic Elevators',
      'Jogging & Cycling Track',
      'Indoor Badminton & Tennis Court',
      'Rainwater Harvesting & STP',
      'Piped Gas Connection',
      'High-Speed Fiber Wi-Fi Zone',
      'Spa, Sauna & Jacuzzi',
      'Library & Co-working Lounge',
      'Senior Citizen Gazebo & Sit-out',
      'Intercom Facility',
      '100% Vaastu Compliant Layout',
      'On-site Maintenance Staff & Waste Disposal'
    ],

    ownerName: 'Godrej Properties Sales Desk',
    ownerPhone: '+919176663200',
    ownerEmail: 'sales@godrejproperties.com',
    approvalStatus: 'approved'
  },
  {
    title: 'Brigade Caladium - Ultra Premium Smart Residences',
    propertyName: 'Brigade Caladium',
    builderName: 'Brigade Group',
    location: 'Hebbal, Bellary Road, Bengaluru',
    locality: 'Hebbal',
    city: 'Bengaluru',
    state: 'Karnataka',
    address: 'Bellary Road, near Esteem Mall, Hebbal, Bengaluru, Karnataka 560024',
    postalCode: '560024',
    lat: 13.0358,
    lng: 77.5970,

    price: '₹ 1.45 Cr - 3.20 Cr',
    priceRaw: 14500000,
    priceUnit: 'Cr',
    priceNote: 'All inclusive excluding registration',
    perSqft: '₹ 8,900 / sq.ft',
    possession: 'Ready to Move',
    possessionDate: 'Ready to Move',
    propertyStatus: 'Ready to Move',
    propertyAge: '0-2 Years',

    buildingType: 'Residential',
    listingType: 'Sell',
    propertyType: 'Apartment',
    userType: 'Builder',

    bedroom: '3 & 4 BHK',
    bathroom: '3 - 5 Bathrooms',
    balconies: '3 Balconies',
    doorFacing: 'East',
    furnishingStatus: 'Fully Furnished Luxury Interiors',
    totalFloors: '22 Floors',
    selectedFloor: '12th Floor',
    totalProjectFloors: '22',
    maintenanceCharge: '₹ 4.20 / sq.ft / month',
    reraNumber: 'PRM/KA/RERA/1251/309/PR/171015/000412',

    propertyHighlights: 'Prime Hebbal Flyover connectivity • Smart home automation included • 2 rooftop infinity pools • 25 mins to Kempegowda Airport',
    description: 'Brigade Caladium represents the pinnacle of luxury living in North Bangalore. Boasting award-winning water-droplet architectural aesthetics, Italian marble living rooms, pre-installed iPad home automation, double-height private sundecks, and unobstructed views of Hebbal Lake.',

    unitConfigurations: [
      {
        bhk: '3 BHK Smart Classic',
        area: '1,850 sq.ft',
        carpetArea: '1,420 sq.ft',
        price: '₹ 1.45 Cr',
        priceNumeric: 14500000,
        bathrooms: '3',
        balconies: '2',
        status: 'Ready to Move'
      },
      {
        bhk: '4 BHK Presidential Penthouse',
        area: '3,450 sq.ft',
        carpetArea: '2,750 sq.ft',
        price: '₹ 3.20 Cr',
        priceNumeric: 32000000,
        bathrooms: '5',
        balconies: '4',
        status: 'Ready to Move'
      }
    ],

    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80'
    ],

    floorPlanImages: [
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=900&q=80',
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=900&q=80'
    ],

    propertyVideo: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    propertyBrochure: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',

    amenities: [
      'Rooftop Infinity Swimming Pool',
      'High-Tech Fitness Studio & Aerobics Room',
      'Clubhouse with Cigar Lounge & Billiards',
      'Children Soft Play Adventure Area',
      'Multi-level Basement Parking with EV Chargers',
      '24/7 Power Backup & Water Filtration Plant',
      'Automated Access Control with Biometric Key',
      'Squash Court & Indoor Badminton',
      'Steam, Sauna & Hydrotherapy Spa',
      'Private Terrace Garden with Sunset Gazebo'
    ],

    ownerName: 'Brigade Group Sales Office',
    ownerPhone: '+919176663200',
    ownerEmail: 'luxury@brigadegroup.com',
    approvalStatus: 'approved'
  }
];

async function seed() {
  console.log('Connecting to MongoDB Atlas...');
  await connectDB();

  console.log('Seeding rich dummy properties into MongoDB Atlas...');
  for (const prop of DUMMY_PROPERTIES) {
    await Property.findOneAndUpdate(
      { title: prop.title },
      { $set: prop },
      { upsert: true, new: true }
    );
    console.log(`✅ Upserted: ${prop.title}`);
  }

  console.log('\n🎉 Finished seeding properties into MongoDB successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
