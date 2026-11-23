/**
 * Comprehensive Dummy Property Dataset for ProBridge Website
 * Fully populated with every property detail to display across all sections:
 * Overview, Unit Configurations, Specifications, Floor Plans, Amenities,
 * Gallery, Walkthrough Video, Home Loan Calculator, Payment Plans,
 * Neighbourhood Map & Points of Interest, Brochure, Builder details, and FAQs.
 */

export const MOCK_PROPERTIES = [
  {
    id: 'prop-godrej-azure-omr',
    _id: 'prop-godrej-azure-omr',
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
    amenitiesText: 'Curated world-class lifestyle amenities spreading across 3 themed zones: High-energy Active Sports Arena, Serenity Zen Gardens with water fountains, and a 4-storey Grand Clubhouse featuring infinity pool and private theatre.',

    paymentPlans: [
      {
        title: 'Special 10:90 Flexi Subvention Plan',
        desc: 'Pay 10% now at booking, nothing until possession handover.',
        tag: 'Most Popular'
      },
      {
        title: 'Standard Construction Linked Plan (CLP)',
        desc: '10% at Booking • 10% on Foundation • 10% every 3rd slab • Balance on completion.',
        tag: 'Flexible'
      },
      {
        title: 'Down Payment Savings Plan',
        desc: 'Pay 95% within 45 days and get an instant cash discount of up to ₹ 4.5 Lac.',
        tag: 'Maximum Savings'
      }
    ],

    landmarks: [
      { category: 'Metro & Transit', name: 'Upcoming Siruseri Metro Station', distance: '800 meters (2 mins)' },
      { category: 'IT & Business Parks', name: 'SIPCOT IT Park (TCS, Infosys, Cognizant)', distance: '2.5 km (5 mins)' },
      { category: 'Education', name: 'Hindustan International School & University', distance: '1.2 km (4 mins)' },
      { category: 'Hospitals', name: 'Chettinad Super Speciality Hospital', distance: '2.8 km (6 mins)' },
      { category: 'Shopping & Malls', name: 'The Marina Mall & INOX Cinemas', distance: '3.1 km (7 mins)' }
    ],

    faqs: [
      {
        q: 'Is Godrej Azure approved by RERA?',
        a: 'Yes, Godrej Azure is fully registered with Tamil Nadu RERA under registration number TN/01/Building/0042/2026. All documentation and approvals are verified.'
      },
      {
        q: 'What is the possession date for the project?',
        a: 'Phase 1 is Ready to Move. Phase 2 final handover is scheduled for December 2026 with interior work already commenced.'
      },
      {
        q: 'Which banks have approved home loans for this project?',
        a: 'The project is pre-approved by all leading financial institutions including SBI, HDFC Bank, ICICI Bank, Axis Bank, and Indian Overseas Bank with loans available up to 85% of property value.'
      },
      {
        q: 'Are the apartments Vaastu compliant?',
        a: 'Yes, 100% of the apartment layouts are designed in accordance with Vaastu principles with entrance options available in North and East directions.'
      },
      {
        q: 'Is covered car parking included with the apartment?',
        a: 'Yes, every 2 and 3 BHK apartment includes 1 dedicated covered stilt/basement car park, and 4 BHK sky villas come with 2 reserved covered parking bays.'
      }
    ],

    badges: [
      { label: 'Verified Listing', variant: 'green' },
      { label: 'RERA Approved', variant: 'blue' },
      { label: 'Zero Brokerage', variant: 'amber' },
      { label: 'Sea Facing', variant: 'teal' }
    ],

    ownerName: 'Godrej Properties Authorised Sales Desk',
    ownerPhone: '+919176663200',
    ownerEmail: 'sales@godrejproperties.com',
    views: 1420
  },

  {
    id: 'prop-brigade-caladium-blr',
    _id: 'prop-brigade-caladium-blr',
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
        bhk: '3 BHK Smart Royale',
        area: '2,240 sq.ft',
        carpetArea: '1,720 sq.ft',
        price: '₹ 1.88 Cr',
        priceNumeric: 18800000,
        bathrooms: '3',
        balconies: '3',
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
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80'
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

    landmarks: [
      { category: 'Metro & Airport', name: 'Kempegowda International Airport (via Bellary Rd)', distance: '28 km (25 mins)' },
      { category: 'IT & Business Parks', name: 'Manyata Tech Park', distance: '4 km (8 mins)' },
      { category: 'Hospitals', name: 'Aster CMI Hospital Hebbal', distance: '1.5 km (3 mins)' },
      { category: 'Shopping', name: 'Esteem Mall', distance: '900 meters (2 mins)' }
    ],

    faqs: [
      {
        q: 'Is home automation installed in all units?',
        a: 'Yes, all units include integrated smart home automation controlling climate, motorized curtains, lighting scenes, and video door phone entry via mobile or tablet.'
      },
      {
        q: 'What is the RERA approval status?',
        a: 'Brigade Caladium is certified under Karnataka RERA registration PRM/KA/RERA/1251/309/PR/171015/000412 with full Occupancy Certificate (OC) received.'
      }
    ],

    badges: [
      { label: 'RERA Approved', variant: 'blue' },
      { label: 'Ready to Move', variant: 'green' },
      { label: 'Lake View', variant: 'teal' }
    ],

    ownerName: 'Brigade Direct Relationship Office',
    ownerPhone: '+919176663200',
    ownerEmail: 'luxury@brigadegroup.com',
    views: 980
  },

  {
    id: 'prop-prestige-marina-ecr',
    _id: 'prop-prestige-marina-ecr',
    title: 'Prestige Marina Bay - Ultra Luxury Waterfront Villas',
    propertyName: 'Prestige Marina Bay',
    builderName: 'Prestige Group',
    location: 'East Coast Road (ECR), Chennai',
    locality: 'Injambakkam, ECR',
    city: 'Chennai',
    state: 'Tamil Nadu',
    address: 'East Coast Road, Injambakkam, Chennai, Tamil Nadu 600115',
    postalCode: '600115',
    lat: 12.9165,
    lng: 80.2520,

    price: '₹ 2.80 Cr - 5.50 Cr',
    priceRaw: 28000000,
    priceUnit: 'Cr',
    priceNote: 'Negotiable for direct buyers',
    perSqft: '₹ 11,200 / sq.ft',
    possession: 'Ready to Move',
    possessionDate: 'Ready to Move',
    propertyStatus: 'Ready to Move',
    propertyAge: 'Under 1 Year',

    buildingType: 'Residential',
    listingType: 'Sell',
    propertyType: 'Independent',
    userType: 'Builder',

    bedroom: '4 & 5 BHK Independent Villa',
    bathroom: '5 Bathrooms',
    balconies: '4 Balconies',
    doorFacing: 'North-East',
    furnishingStatus: 'Fully Furnished Designer Villa',
    totalFloors: 'G + 2 Floors',
    selectedFloor: 'Entire Independent Villa',
    totalProjectFloors: '3',
    maintenanceCharge: '₹ 6,500 / month',
    reraNumber: 'TN/29/Building/0198/2026',

    propertyHighlights: 'Private plunge pool in each villa • 300 meters from pristine beach • Italian modular kitchen • 3 car private garage',
    description: 'An exclusive enclave of bespoke beachside villas on Chennai’s celebrated East Coast Road. Each villa offers expansive double-height ceilings, private landscaped courtyard with a personal plunge pool, sundeck overlooking the ocean breeze, and top-tier security within a gated community.',

    unitConfigurations: [
      {
        bhk: '4 BHK Grand Villa',
        area: '3,200 sq.ft',
        carpetArea: '2,650 sq.ft',
        price: '₹ 2.80 Cr',
        priceNumeric: 28000000,
        bathrooms: '4',
        balconies: '3',
        status: 'Ready to Move'
      },
      {
        bhk: '5 BHK Oceanfront Royal Villa',
        area: '4,850 sq.ft',
        carpetArea: '3,950 sq.ft',
        price: '₹ 4.75 Cr',
        priceNumeric: 47500000,
        bathrooms: '5',
        balconies: '4',
        status: 'Ready to Move'
      }
    ],

    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80'
    ],

    floorPlanImages: [
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=900&q=80'
    ],

    propertyVideo: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    propertyBrochure: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',

    amenities: [
      'Private Swimming Pool',
      'Personal Gymnasium',
      'Private Elevator within Villa',
      'Clubhouse with Beachside Cafe',
      '24/7 Gated Security & Perimeter Alarm',
      'Power Backup & Inverter System',
      'Solar Rooftop Power Panels',
      'Landscaped Zen Garden & Barbeque Deck'
    ],

    landmarks: [
      { category: 'Beach & Leisure', name: 'Injambakkam Beach Walkway', distance: '300 meters (3 mins walk)' },
      { category: 'Connectivity', name: 'Thiruvanmiyur / Adyar Bridge', distance: '8 km (12 mins)' },
      { category: 'Entertainment', name: 'Mayajaal Multiplex ECR', distance: '6 km (8 mins)' }
    ],

    faqs: [
      {
        q: 'Does each villa have its own independent land title?',
        a: 'Yes, each villa is built on a separate, clearly demarcated CMDA & RERA approved plot with 100% clear freehold land ownership title.'
      }
    ],

    badges: [
      { label: 'Private Pool', variant: 'teal' },
      { label: 'Beachside Villa', variant: 'blue' },
      { label: 'Verified Listing', variant: 'green' }
    ],

    ownerName: 'Prestige Luxury Estates Desk',
    ownerPhone: '+919176663200',
    ownerEmail: 'estates@prestigeconstructions.com',
    views: 2100
  },

  {
    id: 'prop-purva-windermere-chennai',
    _id: 'prop-purva-windermere-chennai',
    title: 'Puravankara Windermere - Elite Garden Lake-View Homes',
    propertyName: 'Puravankara Windermere',
    builderName: 'Puravankara Limited',
    location: 'Pallikaranai, near Velachery, Chennai',
    locality: 'Pallikaranai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    address: 'Bhavani Nagar, Pallikaranai, Chennai, Tamil Nadu 600100',
    postalCode: '600100',
    lat: 12.9348,
    lng: 80.2088,

    price: '₹ 68 Lac - 1.28 Cr',
    priceRaw: 6800000,
    priceUnit: 'Lac',
    priceNote: 'Special festive pricing available',
    perSqft: '₹ 5,800 / sq.ft',
    possession: 'Ready to Move',
    possessionDate: 'Ready to Move',
    propertyStatus: 'Ready to Move',
    propertyAge: '1-3 Years',

    buildingType: 'Residential',
    listingType: 'Sell',
    propertyType: 'Apartment',
    userType: 'Builder',

    bedroom: '2 & 3 BHK',
    bathroom: '2 - 3 Bathrooms',
    balconies: '2 Balconies',
    doorFacing: 'North',
    furnishingStatus: 'Semi-Furnished',
    totalFloors: '14 Floors',
    selectedFloor: '5th Floor',
    totalProjectFloors: '14',
    maintenanceCharge: '₹ 3.00 / sq.ft / month',
    reraNumber: 'TN/01/Building/0088/2026',

    propertyHighlights: '55-acre mega township • 2 grand clubhouses • Surrounded by natural lakes • 10 mins from Velachery MRTS',
    description: 'Set within an idyllic 55-acre serene oasis, Purva Windermere offers lakeview apartment residences surrounded by fresh breezes and lush greenery. Perfectly placed between OMR IT Corridor and GST Road, commuting to major technology parks and schools is effortless.',

    unitConfigurations: [
      {
        bhk: '2 BHK Compact',
        area: '1,180 sq.ft',
        carpetArea: '880 sq.ft',
        price: '₹ 68.40 Lac',
        priceNumeric: 6840000,
        bathrooms: '2',
        balconies: '2',
        status: 'Ready to Move'
      },
      {
        bhk: '3 BHK Grande',
        area: '1,590 sq.ft',
        carpetArea: '1,190 sq.ft',
        price: '₹ 94.50 Lac',
        priceNumeric: 9450000,
        bathrooms: '3',
        balconies: '2',
        status: 'Ready to Move'
      },
      {
        bhk: '3 BHK Royale',
        area: '1,890 sq.ft',
        carpetArea: '1,420 sq.ft',
        price: '₹ 1.15 Cr',
        priceNumeric: 11500000,
        bathrooms: '3',
        balconies: '3',
        status: 'Ready to Move'
      }
    ],

    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80'
    ],

    floorPlanImages: [
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=900&q=80'
    ],

    propertyVideo: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    propertyBrochure: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',

    amenities: [
      'Twin Mega Clubhouses (Aura & Club Class)',
      '2 Large Swimming Pools & Sun Deck',
      'Full-size Squash & Tennis Courts',
      'Supermarket & Pharmacy on Premises',
      '24/7 Security with Boom Barriers',
      '100% DG Power Backup for Units & Common Areas',
      'Jogging Track around Natural Lake'
    ],

    landmarks: [
      { category: 'Transit', name: 'Velachery MRTS Railway Station', distance: '4.5 km (10 mins)' },
      { category: 'IT Corridor', name: 'Tidel Park & OMR Expressway', distance: '7.5 km (15 mins)' },
      { category: 'Hospital', name: 'Dr. Kamakshi Memorial Hospital', distance: '2.5 km (6 mins)' }
    ],

    faqs: [
      {
        q: 'Is drinking water available 24/7?',
        a: 'Yes, the project has dedicated dual water pipelines including water treatment plant (WTP) and reverse osmosis (RO) drinking water in every kitchen.'
      }
    ],

    badges: [
      { label: 'Township Living', variant: 'green' },
      { label: 'Lake Facing', variant: 'teal' },
      { label: 'RERA Approved', variant: 'blue' }
    ],

    ownerName: 'Puravankara Direct Sales Office',
    ownerPhone: '+919176663200',
    ownerEmail: 'sales@puravankara.com',
    views: 1650
  }
];

export default MOCK_PROPERTIES;
