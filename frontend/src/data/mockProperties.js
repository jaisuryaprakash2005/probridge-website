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
,
  {
    "id": "prop-godrej-palm-retreat-pune",
    "_id": "prop-godrej-palm-retreat-pune",
    "title": "Godrej Palm Retreat - Resort Style Residences",
    "propertyName": "Godrej Palm Retreat",
    "builderName": "Godrej Properties",
    "location": "Camp, Pune Cantonment, Pune",
    "locality": "Camp",
    "city": "Pune",
    "state": "Maharashtra",
    "address": "Near Pune Station & MG Road, Camp, Pune, Maharashtra 411001",
    "postalCode": "411001",
    "lat": 18.5167,
    "lng": 73.8789,
    "price": "₹ 1.13 Cr",
    "priceRaw": 11300000,
    "priceUnit": "Cr",
    "priceNote": "All inclusive pricing with zero brokerage",
    "perSqft": "₹ 8,200 / sq.ft",
    "possession": "Under Construction",
    "possessionDate": "December 2027",
    "propertyStatus": "Under Construction",
    "propertyAge": "Under Construction",
    "buildingType": "Residential",
    "listingType": "Sell",
    "propertyType": "Apartment",
    "userType": "Developer",
    "bedroom": "2 BHK, 3 BHK",
    "bathroom": 2,
    "balconies": 2,
    "doorFacing": "East",
    "furnishingStatus": "Semi-Furnished",
    "totalFloors": 22,
    "selectedFloor": 12,
    "totalProjectFloors": 22,
    "maintenanceCharge": "₹ 4,200 / month",
    "reraNumber": "P52100021389",
    "propertyHighlights": [
      "Low Density Resort Style Living in Historic Camp",
      "Lavish 25,000 sq.ft Clubhouse with Heated Pool",
      "5 Minutes from Pune Railway Station and MG Road"
    ],
    "description": "Godrej Palm Retreat brings ultra-modern resort-themed living to the heart of Camp, Pune with sprawling sky gardens, infinity pool, and seamless metro access.",
    "unitConfigurations": [
      {
        "bhk": "2 BHK",
        "type": "Premium 2 BHK",
        "superArea": "1,120 sq.ft",
        "carpetArea": "840 sq.ft",
        "price": "₹ 1.13 Cr",
        "priceBreakup": "Base price ₹ 95 Lac + Parking & Amenities ₹ 18 Lac",
        "status": "Available"
      },
      {
        "bhk": "3 BHK",
        "type": "Luxury 3 BHK",
        "superArea": "1,560 sq.ft",
        "carpetArea": "1,180 sq.ft",
        "price": "₹ 1.75 Cr",
        "priceBreakup": "Base price ₹ 1.48 Cr + Premium facing & 2 Parkings",
        "status": "Fast Selling"
      }
    ],
    "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80"
    ],
    "floorPlanImages": [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&auto=format&fit=crop&q=80"
    ],
    "propertyVideo": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "propertyBrochure": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    "amenities": [
      "Resort Swimming Pool",
      "Gymnasium",
      "Landscaped Garden",
      "Clubhouse",
      "Children Play Area",
      "24/7 Security"
    ],
    "amenitiesText": "Resort Swimming Pool, Gymnasium, Landscaped Garden, Clubhouse, Children Play Area, 24/7 Security",
    "paymentPlans": [
      {
        "title": "Special 20:80 Payment Plan",
        "type": "Construction Linked",
        "description": "Pay 20% on booking, 80% on possession"
      }
    ],
    "landmarks": [
      {
        "category": "Transit",
        "name": "Pune Junction",
        "distance": "1.8 km"
      },
      {
        "category": "Commercial",
        "name": "MG Road Commercial Strip",
        "distance": "0.8 km"
      }
    ],
    "faqs": [
      {
        "q": "Is it RERA approved?",
        "a": "Yes, registered with MahaRERA under P52100021389."
      }
    ],
    "badges": [
      {
        "label": "Resort Living",
        "variant": "green"
      }
    ],
    "ownerName": "Godrej Sales Lounge",
    "ownerPhone": "+919176663200",
    "ownerEmail": "sales@godrejproperties.com",
    "views": 1840
  },
  {
    "id": "prop-purva-silversky-pune",
    "_id": "prop-purva-silversky-pune",
    "title": "Purva Silversky - Modern Valley Facing Homes",
    "propertyName": "Purva Silversky",
    "builderName": "Puravankara Limited",
    "location": "Chimbali, Pune",
    "locality": "Chimbali",
    "city": "Pune",
    "state": "Maharashtra",
    "address": "Near Alandi-Chakan Road, Chimbali, Pune, Maharashtra 410501",
    "postalCode": "410501",
    "lat": 18.6754,
    "lng": 73.8682,
    "price": "₹ 68.5 Lac",
    "priceRaw": 6850000,
    "priceUnit": "Lac",
    "priceNote": "Exclusive launch discounts applicable",
    "perSqft": "₹ 5,760 / sq.ft",
    "possession": "Under Construction",
    "possessionDate": "March 2028",
    "propertyStatus": "Under Construction",
    "propertyAge": "Under Construction",
    "buildingType": "Residential",
    "listingType": "Sell",
    "propertyType": "Apartment",
    "userType": "Developer",
    "bedroom": "2 BHK, 3 BHK",
    "bathroom": 2,
    "balconies": 2,
    "doorFacing": "North-East",
    "furnishingStatus": "Semi-Furnished",
    "totalFloors": 18,
    "selectedFloor": 9,
    "totalProjectFloors": 18,
    "maintenanceCharge": "₹ 3,200 / month",
    "reraNumber": "P52100028912",
    "propertyHighlights": [
      "Strategic Location near Talawade IT Park & Chakan MIDC",
      "Panoramic Hillside & Valley Views",
      "BluNex Smart Home Automation with Voice Controls"
    ],
    "description": "Purva Silversky in Chimbali offers intelligently planned 2 & 3 BHK homes with luxury amenities, landscaped podiums, and excellent connectivity to PCMC industrial belts.",
    "unitConfigurations": [
      {
        "bhk": "2 BHK",
        "type": "Smart 2 BHK",
        "superArea": "1,040 sq.ft",
        "carpetArea": "760 sq.ft",
        "price": "₹ 68.5 Lac",
        "priceBreakup": "All inclusive pricing",
        "status": "Available"
      }
    ],
    "image": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80"
    ],
    "floorPlanImages": [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&auto=format&fit=crop&q=80"
    ],
    "propertyVideo": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "propertyBrochure": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    "amenities": [
      "Clubhouse",
      "Swimming Pool",
      "Badminton Court",
      "Kids Play Zone",
      "Jogging Track"
    ],
    "amenitiesText": "Clubhouse, Swimming Pool, Badminton Court, Kids Play Zone, Jogging Track",
    "paymentPlans": [
      {
        "title": "10:90 Developer Plan",
        "type": "Special Plan",
        "description": "10% on booking, 90% at completion"
      }
    ],
    "landmarks": [
      {
        "category": "Workplace",
        "name": "Chakan Industrial Hub",
        "distance": "6.0 km"
      }
    ],
    "faqs": [
      {
        "q": "When is possession?",
        "a": "Possession begins March 2028."
      }
    ],
    "badges": [
      {
        "label": "Smart Homes",
        "variant": "teal"
      }
    ],
    "ownerName": "Puravankara Sales Desk",
    "ownerPhone": "+919176663200",
    "ownerEmail": "sales@puravankara.com",
    "views": 1320
  },
  {
    "id": "prop-kohinoor-viva-dudulgaon",
    "_id": "prop-kohinoor-viva-dudulgaon",
    "title": "Kohinoor Viva City - Elevated Modern High-Rise",
    "propertyName": "Kohinoor Viva City",
    "builderName": "Kohinoor Group Pune",
    "location": "Dudulgaon, Moshi-Alandi Road, Pune",
    "locality": "Dudulgaon",
    "city": "Pune",
    "state": "Maharashtra",
    "address": "Near Alandi Road, Dudulgaon, Pune, Maharashtra 412105",
    "postalCode": "412105",
    "lat": 18.6672,
    "lng": 73.8741,
    "price": "₹ 54.5 Lac",
    "priceRaw": 5450000,
    "priceUnit": "Lac",
    "priceNote": "Best price guarantee in Dudulgaon",
    "perSqft": "₹ 4,646 / sq.ft",
    "possession": "Under Construction",
    "possessionDate": "June 2027",
    "propertyStatus": "Under Construction",
    "propertyAge": "Under Construction",
    "buildingType": "Residential",
    "listingType": "Sell",
    "propertyType": "Apartment",
    "userType": "Developer",
    "bedroom": "2 BHK, 3 BHK",
    "bathroom": 2,
    "balconies": 1,
    "doorFacing": "East",
    "furnishingStatus": "Unfurnished",
    "totalFloors": 24,
    "selectedFloor": 11,
    "totalProjectFloors": 24,
    "maintenanceCharge": "₹ 2,800 / month",
    "reraNumber": "P52100031849",
    "propertyHighlights": [
      "Sada Sukhi Raho Guarantee by Kohinoor",
      "30+ Lifestyle Amenities including Sky Walk and Infinity Pool",
      "Direct Connectivity to Pune Ring Road and BRTS Corridor"
    ],
    "description": "Kohinoor Viva City at Dudulgaon features premium high-rise residences crafted for contemporary urban families with top-tier education institutes and retail corridors nearby.",
    "unitConfigurations": [
      {
        "bhk": "2 BHK",
        "type": "Deluxe 2 BHK",
        "superArea": "980 sq.ft",
        "carpetArea": "710 sq.ft",
        "price": "₹ 54.5 Lac",
        "priceBreakup": "All inclusive",
        "status": "Available"
      }
    ],
    "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80"
    ],
    "floorPlanImages": [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&auto=format&fit=crop&q=80"
    ],
    "propertyVideo": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "propertyBrochure": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    "amenities": [
      "Sky Walk",
      "Gymnasium",
      "Landscaped Garden",
      "Amphitheatre",
      "Senior Citizen Park"
    ],
    "amenitiesText": "Sky Walk, Gymnasium, Landscaped Garden, Amphitheatre, Senior Citizen Park",
    "paymentPlans": [
      {
        "title": "Flexi Booking Plan",
        "type": "Construction Linked",
        "description": "Easy milestone installments"
      }
    ],
    "landmarks": [
      {
        "category": "Transit",
        "name": "BRTS Station",
        "distance": "0.4 km"
      }
    ],
    "faqs": [
      {
        "q": "Is water available?",
        "a": "Dual supply with PCMC and borewell filtration."
      }
    ],
    "badges": [
      {
        "label": "High ROI",
        "variant": "green"
      }
    ],
    "ownerName": "Kohinoor Direct Sales",
    "ownerPhone": "+919176663200",
    "ownerEmail": "sales@kohinoorpune.com",
    "views": 1910
  },
  {
    "id": "prop-kolte-life-republic-pune",
    "_id": "prop-kolte-life-republic-pune",
    "title": "Kolte Patil Life Republic - Integrated 400-Acre Township",
    "propertyName": "Kolte Patil Life Republic",
    "builderName": "Kolte Patil Developers",
    "location": "Hinjawadi, Pune",
    "locality": "Hinjawadi",
    "city": "Pune",
    "state": "Maharashtra",
    "address": "Near Hinjawadi IT Park Phase 1 & 2, Hinjawadi, Pune, Maharashtra 411057",
    "postalCode": "411057",
    "lat": 18.5912,
    "lng": 73.7389,
    "price": "₹ 78.0 Lac",
    "priceRaw": 7800000,
    "priceUnit": "Lac",
    "priceNote": "Direct builder inventory with tax concessions",
    "perSqft": "₹ 6,300 / sq.ft",
    "possession": "Under Construction",
    "possessionDate": "December 2026",
    "propertyStatus": "Under Construction",
    "propertyAge": "Under Construction",
    "buildingType": "Residential",
    "listingType": "Sell",
    "propertyType": "Apartment",
    "userType": "Developer",
    "bedroom": "2 BHK, 3 BHK",
    "bathroom": 2,
    "balconies": 2,
    "doorFacing": "North",
    "furnishingStatus": "Semi-Furnished",
    "totalFloors": 26,
    "selectedFloor": 15,
    "totalProjectFloors": 26,
    "maintenanceCharge": "₹ 3,500 / month",
    "reraNumber": "P52100017116",
    "propertyHighlights": [
      "400-Acre Integrated Township with Anisha Global School inside",
      "Walking distance from major IT campuses (Infosys, Wipro, TCS)",
      "Operational shopping mall, hospital & sports complex inside campus"
    ],
    "description": "Kolte Patil Life Republic is one of Pune's most iconic integrated townships offering an idyllic lifestyle with lush green parks, community lakes, and premier sports arenas.",
    "unitConfigurations": [
      {
        "bhk": "2 BHK",
        "type": "Township 2 BHK",
        "superArea": "1,090 sq.ft",
        "carpetArea": "810 sq.ft",
        "price": "₹ 78.0 Lac",
        "priceBreakup": "All inclusive",
        "status": "Available"
      }
    ],
    "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80"
    ],
    "floorPlanImages": [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&auto=format&fit=crop&q=80"
    ],
    "propertyVideo": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "propertyBrochure": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    "amenities": [
      "Mega Township Club",
      "Olympic Swimming Pool",
      "Cricket Ground",
      "Skating Rink",
      "24/7 Gated Security"
    ],
    "amenitiesText": "Mega Township Club, Olympic Swimming Pool, Cricket Ground, Skating Rink, 24/7 Gated Security",
    "paymentPlans": [
      {
        "title": "Township Flexi Scheme",
        "type": "Construction Linked",
        "description": "Pay as the construction proceeds"
      }
    ],
    "landmarks": [
      {
        "category": "Tech Park",
        "name": "Infosys Hinjawadi Campus",
        "distance": "2.5 km"
      }
    ],
    "faqs": [
      {
        "q": "Is there a school inside?",
        "a": "Yes, Anisha Global School is fully operational on campus."
      }
    ],
    "badges": [
      {
        "label": "Mega Township",
        "variant": "green"
      }
    ],
    "ownerName": "Kolte Patil Official Desk",
    "ownerPhone": "+919176663200",
    "ownerEmail": "sales@koltepatil.com",
    "views": 2240
  },
  {
    "id": "prop-lodha-bella-vita-pune",
    "_id": "prop-lodha-bella-vita-pune",
    "title": "Lodha Bella Vita - European-Inspired Forest Living",
    "propertyName": "Lodha Bella Vita",
    "builderName": "Lodha Group",
    "location": "Camp, Pune",
    "locality": "Camp",
    "city": "Pune",
    "state": "Maharashtra",
    "address": "Near Command Hospital, Camp, Pune, Maharashtra 411040",
    "postalCode": "411040",
    "lat": 18.5089,
    "lng": 73.8891,
    "price": "₹ 1.20 Cr",
    "priceRaw": 12000000,
    "priceUnit": "Cr",
    "priceNote": "Exclusive Lodha Privilege discounts",
    "perSqft": "₹ 8,900 / sq.ft",
    "possession": "Under Construction",
    "possessionDate": "September 2027",
    "propertyStatus": "Under Construction",
    "propertyAge": "Under Construction",
    "buildingType": "Residential",
    "listingType": "Sell",
    "propertyType": "Apartment",
    "userType": "Developer",
    "bedroom": "2 BHK, 3 BHK",
    "bathroom": 2,
    "balconies": 2,
    "doorFacing": "East",
    "furnishingStatus": "Semi-Furnished",
    "totalFloors": 28,
    "selectedFloor": 14,
    "totalProjectFloors": 28,
    "maintenanceCharge": "₹ 4,500 / month",
    "reraNumber": "P52100045612",
    "propertyHighlights": [
      "Italian Marble Flooring & Floor-to-Ceiling French Windows",
      "Surrounded by 100+ Acres of Protected Reserve Forest",
      "Club Saint Amand with 5-Star Hospitality Services"
    ],
    "description": "Lodha Bella Vita is crafted for connoisseurs of fine living with Italian architecture, lush wooded gardens, and panoramic views of Pune cantonment greenery.",
    "unitConfigurations": [
      {
        "bhk": "2 BHK",
        "type": "Palatial 2 BHK",
        "superArea": "1,160 sq.ft",
        "carpetArea": "880 sq.ft",
        "price": "₹ 1.20 Cr",
        "priceBreakup": "All inclusive",
        "status": "Available"
      }
    ],
    "image": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80"
    ],
    "floorPlanImages": [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&auto=format&fit=crop&q=80"
    ],
    "propertyVideo": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "propertyBrochure": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    "amenities": [
      "European Grand Clubhouse",
      "Infinity Edge Pool",
      "Squash Court",
      "Private Mini Theatre",
      "Banquet Lawn"
    ],
    "amenitiesText": "European Grand Clubhouse, Infinity Edge Pool, Squash Court, Private Mini Theatre, Banquet Lawn",
    "paymentPlans": [
      {
        "title": "Lodha Easy Pay",
        "type": "Flexible Payment",
        "description": "25% every 6 months"
      }
    ],
    "landmarks": [
      {
        "category": "Medical",
        "name": "Command Hospital",
        "distance": "1.2 km"
      }
    ],
    "faqs": [
      {
        "q": "Who is the architect?",
        "a": "Designed by renowned international architectural masters."
      }
    ],
    "badges": [
      {
        "label": "Luxury Edition",
        "variant": "blue"
      }
    ],
    "ownerName": "Lodha Luxury Gallery",
    "ownerPhone": "+919176663200",
    "ownerEmail": "luxury@lodhagroup.com",
    "views": 2450
  },
  {
    "id": "prop-prestige-lakeside-blr",
    "_id": "prop-prestige-lakeside-blr",
    "title": "Prestige Lakeside Habitat - Enchanted Disney Themed Homes",
    "propertyName": "Prestige Lakeside Habitat",
    "builderName": "Prestige Group",
    "location": "Whitefield, Varthur Main Road, Bengaluru",
    "locality": "Whitefield",
    "city": "Bengaluru",
    "state": "Karnataka",
    "address": "Varthur Main Road, Whitefield, Bengaluru, Karnataka 560087",
    "postalCode": "560087",
    "lat": 12.9421,
    "lng": 77.7465,
    "price": "₹ 1.40 Cr",
    "priceRaw": 14000000,
    "priceUnit": "Cr",
    "priceNote": "Direct builder inventory ready for registration",
    "perSqft": "₹ 8,100 / sq.ft",
    "possession": "Ready to Move",
    "possessionDate": "Ready to Move",
    "propertyStatus": "Ready to Move",
    "propertyAge": "1-2 Years",
    "buildingType": "Residential",
    "listingType": "Sell",
    "propertyType": "Apartment",
    "userType": "Developer",
    "bedroom": "2 BHK, 3 BHK",
    "bathroom": 2,
    "balconies": 2,
    "doorFacing": "East",
    "furnishingStatus": "Semi-Furnished",
    "totalFloors": 29,
    "selectedFloor": 18,
    "totalProjectFloors": 29,
    "maintenanceCharge": "₹ 4,800 / month",
    "reraNumber": "PRM/KA/RERA/1251/310/PR/170915/000176",
    "propertyHighlights": [
      "102-Acre Sprawling Lake-Facing Township in Whitefield",
      "Overlooking Varthur Lake with Pristine Breeze",
      "4 Grand Clubhouses & 80% Dedicated Open Green Landscape"
    ],
    "description": "Prestige Lakeside Habitat offers world-class residences overlooking the calm waters of Varthur Lake with premium sports complexes, convenience retail, and 24-hour concierge services.",
    "unitConfigurations": [
      {
        "bhk": "2 BHK",
        "type": "Lakeview 2 BHK",
        "superArea": "1,215 sq.ft",
        "carpetArea": "910 sq.ft",
        "price": "₹ 1.40 Cr",
        "priceBreakup": "All inclusive pricing",
        "status": "Ready"
      }
    ],
    "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80"
    ],
    "floorPlanImages": [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&auto=format&fit=crop&q=80"
    ],
    "propertyVideo": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "propertyBrochure": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    "amenities": [
      "4 Clubhouses",
      "Tennis & Badminton Courts",
      "Olympic Pool",
      "Lakefront Promenade",
      "Cricket Pitch"
    ],
    "amenitiesText": "4 Clubhouses, Tennis & Badminton Courts, Olympic Pool, Lakefront Promenade, Cricket Pitch",
    "paymentPlans": [
      {
        "title": "Ready to Move Bank Loan Plan",
        "type": "Bank Approved",
        "description": "Loan up to 85% approved from SBI and HDFC"
      }
    ],
    "landmarks": [
      {
        "category": "Tech Corridor",
        "name": "ITPL Whitefield",
        "distance": "4.8 km"
      }
    ],
    "faqs": [
      {
        "q": "Is it ready for occupancy?",
        "a": "Yes, OC received and families already residing."
      }
    ],
    "badges": [
      {
        "label": "Ready to Move",
        "variant": "green"
      }
    ],
    "ownerName": "Prestige Estates Direct",
    "ownerPhone": "+919176663200",
    "ownerEmail": "sales@prestigeconstructions.com",
    "views": 3120
  },
  {
    "id": "prop-brigade-cornerstone-blr",
    "_id": "prop-brigade-cornerstone-blr",
    "title": "Brigade Cornerstone Utopia - Integrated Smart City Living",
    "propertyName": "Brigade Cornerstone Utopia",
    "builderName": "Brigade Group",
    "location": "Whitefield, Varthur Road, Bengaluru",
    "locality": "Whitefield",
    "city": "Bengaluru",
    "state": "Karnataka",
    "address": "Varthur Main Road, Whitefield, Bengaluru, Karnataka 560087",
    "postalCode": "560087",
    "lat": 12.9468,
    "lng": 77.749,
    "price": "₹ 1.18 Cr",
    "priceRaw": 11800000,
    "priceUnit": "Cr",
    "priceNote": "Special festival payment benefits available",
    "perSqft": "₹ 7,600 / sq.ft",
    "possession": "Under Construction",
    "possessionDate": "June 2027",
    "propertyStatus": "Under Construction",
    "propertyAge": "Under Construction",
    "buildingType": "Residential",
    "listingType": "Sell",
    "propertyType": "Apartment",
    "userType": "Developer",
    "bedroom": "2 BHK, 3 BHK",
    "bathroom": 2,
    "balconies": 2,
    "doorFacing": "North-East",
    "furnishingStatus": "Semi-Furnished",
    "totalFloors": 26,
    "selectedFloor": 12,
    "totalProjectFloors": 26,
    "maintenanceCharge": "₹ 4,000 / month",
    "reraNumber": "PRM/KA/RERA/1251/446/PR/181122/002176",
    "propertyHighlights": [
      "47-Acre Integrated Smart High-Tech Township",
      "Cineplex, Multiplex & High-Street Retail within premises",
      "Pedestrian-Only Walkways & Butterfly Garden"
    ],
    "description": "Brigade Cornerstone Utopia is a vibrant, futuristic 47-acre integrated township in Whitefield designed to bring commercial offices, premium homes, and boutique high street retail together.",
    "unitConfigurations": [
      {
        "bhk": "2 BHK",
        "type": "Smart 2 BHK",
        "superArea": "1,080 sq.ft",
        "carpetArea": "790 sq.ft",
        "price": "₹ 1.18 Cr",
        "priceBreakup": "All inclusive",
        "status": "Available"
      }
    ],
    "image": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80"
    ],
    "floorPlanImages": [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&auto=format&fit=crop&q=80"
    ],
    "propertyVideo": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "propertyBrochure": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    "amenities": [
      "Futuristic Clubhouse",
      "Smart Gym",
      "Retail High Street",
      "Amphitheatre",
      "Jogging Trail"
    ],
    "amenitiesText": "Futuristic Clubhouse, Smart Gym, Retail High Street, Amphitheatre, Jogging Trail",
    "paymentPlans": [
      {
        "title": "Brigade 15:85 Easy Pay",
        "type": "Construction Linked",
        "description": "Pay 15% now, remainder across construction"
      }
    ],
    "landmarks": [
      {
        "category": "Metro",
        "name": "Kadugodi Whitefield Metro",
        "distance": "3.8 km"
      }
    ],
    "faqs": [
      {
        "q": "Is retail space included?",
        "a": "Yes, high-street shopping and cinema are right inside."
      }
    ],
    "badges": [
      {
        "label": "Future City",
        "variant": "teal"
      }
    ],
    "ownerName": "Brigade Group Sales Office",
    "ownerPhone": "+919176663200",
    "ownerEmail": "sales@brigadegroup.com",
    "views": 2780
  }
];

export default MOCK_PROPERTIES;
