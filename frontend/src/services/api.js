import axios from 'axios';
import { MOCK_PROPERTIES } from '../data/mockProperties';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth ───────────────────────────────────────────────────────────────────
export const login         = (data) => api.post('/auth/login', data);
export const register      = (data) => api.post('/auth/register', data);
export const getMe         = ()     => api.get('/auth/me');
export const updateProfile = (data) => api.patch('/auth/profile', data);
export const sendPhoneOtp  = (data) => api.post('/auth/send-otp', data);
export const phoneLogin    = (data) => api.post('/auth/phone-login', data);

// ─── Properties (show database values when connected, fallback to dummy when disconnected) ─────────
export const getProperties = async (params = {}) => {
  try {
    const res = await api.get('/properties', { params });
    if (res.data?.success) {
      // Database connected: return ONLY database value
      return res;
    }
  } catch (err) {
    console.warn('[API fallback] Backend/Database disconnected, using dummy mock properties');
  }

  // Database NOT connected: fallback to dummy properties
  let filtered = [...MOCK_PROPERTIES];
  if (params.builder) {
    const bLower = params.builder.toLowerCase();
    filtered = filtered.filter(p => (p.builderName || '').toLowerCase().includes(bLower));
  }
  if (params.city) {
    const cLower = params.city.toLowerCase();
    filtered = filtered.filter(p => (p.city || '').toLowerCase().includes(cLower));
  }
  if (params.locality || params.localities) {
    const targetLoc = (params.locality || params.localities).toLowerCase();
    filtered = filtered.filter(p => (p.locality || '').toLowerCase().includes(targetLoc));
  }

  return {
    data: {
      success: true,
      properties: filtered,
      results: filtered,
      total: filtered.length,
      isDummyFallback: true,
    }
  };
};

export const getProperty = async (id) => {
  try {
    const res = await api.get(`/properties/${id}`);
    const liveProp = res.data?.property || res.data?.result;
    if (res.data?.success && liveProp) {
      // Database connected: return ONLY the real database property as-is
      return { data: { success: true, property: liveProp, result: liveProp } };
    }
  } catch (err) {
    console.warn(`[API fallback] Backend/Database disconnected for property ${id}, using dummy data`);
  }

  // Database NOT connected: fallback to matching dummy property
  const mockFound = MOCK_PROPERTIES.find(
    (p) => String(p.id) === String(id) || String(p._id) === String(id)
  );
  const finalProp = mockFound || MOCK_PROPERTIES[0];
  return { data: { success: true, property: finalProp, result: finalProp, isDummyFallback: true } };
};

export const createProperty      = (data)   => api.post('/properties', data);
export const deleteProperty      = (id)     => api.delete(`/properties/${id}`);
export const getMyListings       = ()       => api.get('/properties/my/listings');

export const getCityCounts = async () => {
  try {
    const res = await api.get('/properties/city-counts');
    if (res.data?.counts) return res;
  } catch (_) {}
  return {
    data: {
      success: true,
      counts: { Chennai: 14, Bengaluru: 18, Mumbai: 10, Hyderabad: 8, Pune: 6 }
    }
  };
};

export const getCategoryCounts = async () => {
  try {
    const res = await api.get('/properties/category-counts');
    if (res.data?.counts) return res;
  } catch (_) {}
  return {
    data: {
      success: true,
      counts: { apartment: 24, villa: 12, plot: 16, commercial: 8, independent: 14, pg: 6 }
    }
  };
};

export const getBuilderCounts = async () => {
  try {
    const res = await api.get('/properties/builder-counts');
    if (res.data?.counts) return res;
  } catch (_) {}

  // Compute dynamically from MOCK_PROPERTIES
  const counts = {};
  MOCK_PROPERTIES.forEach(p => {
    if (p.builderName) {
      counts[p.builderName] = (counts[p.builderName] || 0) + 1;
    }
  });

  return {
    data: {
      success: true,
      counts
    }
  };
};

export const getLocalityCounts = async () => {
  try {
    const res = await api.get('/properties/locality-counts');
    if (res.data?.localities) return res;
  } catch (_) {}

  // Compute dynamically from existing MOCK_PROPERTIES
  const locMap = {};
  MOCK_PROPERTIES.forEach((p) => {
    const loc = (p.locality || '').trim();
    if (!loc) return;
    const city = (p.city || '').trim();
    const key = city ? `${loc}, ${city}` : loc;

    if (!locMap[key]) {
      locMap[key] = {
        name: loc,
        city: city,
        title: key,
        count: 0,
        prices: [],
        sqftPrices: []
      };
    }
    locMap[key].count += 1;
    if (p.priceRaw) locMap[key].prices.push(Number(p.priceRaw));
    if (p.perSqft) {
      const sqftNum = Number(String(p.perSqft).replace(/[^0-9]/g, ''));
      if (sqftNum > 0) locMap[key].sqftPrices.push(sqftNum);
    }
  });

  const localities = Object.values(locMap).map((loc) => {
    let avgPriceDisplay = 'Price on Request';
    if (loc.sqftPrices.length > 0) {
      const avgSqft = Math.round(loc.sqftPrices.reduce((a, b) => a + b, 0) / loc.sqftPrices.length);
      avgPriceDisplay = `₹ ${avgSqft.toLocaleString('en-IN')}/Sq. Ft`;
    } else if (loc.prices.length > 0) {
      const avgPrice = loc.prices.reduce((a, b) => a + b, 0) / loc.prices.length;
      if (avgPrice >= 10000000) {
        avgPriceDisplay = `₹ ${(avgPrice / 10000000).toFixed(2).replace(/\.00$/, '')} Crore`;
      } else {
        avgPriceDisplay = `₹ ${(avgPrice / 100000).toFixed(1).replace(/\.0$/, '')} Lac`;
      }
    }
    return { ...loc, avgPriceDisplay };
  }).sort((a, b) => b.count - a.count);

  return {
    data: {
      success: true,
      localities
    }
  };
};

// ─── Search ─────────────────────────────────────────────────────────────────
export const searchProperties = async (params) => {
  try {
    const res = await api.get('/search', { params });
    if (res.data?.success) {
      // Database connected: return ONLY database search results
      return res;
    }
  } catch (_) {
    console.warn('[API fallback] Backend/Database disconnected for search, using dummy properties');
  }
  // Database NOT connected: fallback to dummy properties
  return {
    data: {
      success: true,
      properties: MOCK_PROPERTIES,
      results: MOCK_PROPERTIES,
      total: MOCK_PROPERTIES.length,
      isDummyFallback: true,
    }
  };
};

export const searchCities     = (q)      => api.get('/search/cities', { params: { q } });
export const searchLocalities = (params) => api.get('/search/localities', { params });

// ─── Filters ────────────────────────────────────────────────────────────────
export const getFilters = () => api.get('/filters');

// ─── Saved ──────────────────────────────────────────────────────────────────
export const getSaved = async () => {
  try {
    const res = await api.get('/saved');
    if (res.data) return res;
  } catch (_) {}
  return { data: { success: true, savedIds: [], properties: [] } };
};

export const toggleSaved = (propertyId) => api.post('/saved/toggle', { propertyId });

// ─── Enquiries ──────────────────────────────────────────────────────────────
export const sendEnquiry = async (data) => {
  try {
    return await api.post('/enquiries', data);
  } catch (_) {
    // When offline, simulate successful lead capture
    return { data: { success: true, message: 'Thank you! Your enquiry has been recorded.' } };
  }
};

export const getMyEnquiries = () => api.get('/enquiries/my');

export const getContactStatus = async (params = {}) => {
  try {
    const res = await api.get('/enquiries/contact-status', { params });
    return res;
  } catch (_) {
    return { data: { success: true, submitted: false } };
  }
};

// ─── Ads / Sponsored Banners ────────────────────────────────────────────────
export const getActiveAds = async () => {
  try {
    const res = await api.get('/ads/active');
    if (res.data?.ads && res.data.ads.length > 0) return res;
  } catch (_) {}
  return { data: { success: true, ads: [] } };
};

export const trackAdClick = (id) => api.post(`/ads/${id}/click`);

// ─── Top Banners ────────────────────────────────────────────────────────────
export const getTopBanners = async () => {
  try {
    const res = await api.get('/top-banners');
    if (res.data?.banners && res.data.banners.length > 0) return res;
  } catch (_) {}
  return {
    data: {
      success: true,
      banners: [
        {
          _id: 'banner-1',
          title: 'Special Pre-Launch Offers on Sea Facing Luxury Apartments',
          subtitle: 'Starting ₹ 82.5 Lac* on OMR Chennai. Zero Brokerage & Instant Site Visit',
          ctaText: 'Explore Now',
          link: '/property/prop-godrej-azure-omr',
          image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
          isActive: true
        }
      ]
    }
  };
};

export const getBuilders = async () => {
  try {
    const res = await api.get('/builders');
    if (res.data) return res;
  } catch (_) {}
  return { data: { success: true, results: [] } };
};

export const trackTopBannerClick = (id) => api.post(`/top-banners/${id}/click`);

// ─── Upload ─────────────────────────────────────────────────────────────────
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

// ─── Careers ────────────────────────────────────────────────────────────────
export const getCareers = () => api.get('/careers');
export const getCareerById = (id) => api.get('/careers/' + id);
export const applyForCareer = (data) => {
  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    return api.post('/careers/apply', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  return api.post('/careers/apply', data);
};

// ─── YouTube Links (Spotlight Coverflow) ─────────────────────────────────────
const INITIAL_YOUTUBE_LINKS = [
  {
    _id: 'yt-1',
    title: 'Touring Luxury Seaside Villas in ECR Chennai',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Explore breathtaking private seaside villas with Italian marble finish, private pool, landscaped gardens and ocean views along East Coast Road.',
    category: 'Virtual Tours',
    status: 'active',
  },
  {
    _id: 'yt-2',
    title: 'Top 5 Real Estate Investment Hubs in Bengaluru',
    youtubeUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    description: 'Comprehensive market analysis covering upcoming metro extensions, commercial corridors, and high appreciation residential micro-markets.',
    category: 'Market Trends',
    status: 'active',
  },
  {
    _id: 'yt-3',
    title: 'Modern High-Rise Duplex Penthouse Walkthrough',
    youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    description: 'Walk through an ultra-spacious 4 BHK duplex penthouse featuring smart home automation, open terrace garden, and panoramic city skyline views.',
    category: 'Walkthrough',
    status: 'active',
  },
  {
    _id: 'yt-4',
    title: 'Pre-Leased Commercial Assets: 9% Rental Yield Guide',
    youtubeUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    description: 'Understand how institutional investors lock in 9-year corporate leases with multinational banks and tech giants for reliable monthly returns.',
    category: 'Investment Advice',
    status: 'active',
  },
  {
    _id: 'yt-5',
    title: 'Understanding RERA & Legal Due Diligence in 2026',
    youtubeUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
    description: 'A masterclass on title verification, encumbrance certificates, layout sanctions, and protecting your capital with verified documentation.',
    category: 'Legal Guide',
    status: 'active',
  },
];

export const getYoutubeLinks = async () => {
  try {
    const res = await api.get('/youtube-links');
    if (res.data?.success && Array.isArray(res.data?.links || res.data?.results)) {
      return { data: { success: true, links: res.data.links || res.data.results } };
    }
  } catch (_) {}
  return { data: { success: true, links: INITIAL_YOUTUBE_LINKS, isDummyFallback: true } };
};

// ─── Blogs & Articles ───────────────────────────────────────────────────────
const INITIAL_BLOGS = [
  {
    _id: 'blog-1',
    title: 'Essential Guide to Buying Real Estate in South India: 2026 Edition',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    description: 'The real estate market across Chennai, Bengaluru, and Hyderabad is undergoing unprecedented transformation driven by infrastructure expansion, metro connectivity, and thriving tech corridors. Whether you are a first-time homebuyer or an experienced investor looking to diversify into commercial spaces, understanding legal title verification, RERA compliance, and emerging growth corridors is paramount for long-term capital appreciation.',
    keyfactors: [
      'Strict RERA approval and legal title diligence',
      'Proximity to upcoming metro stations and ring roads',
      'High rental yield potential in IT-centric corridors',
      'Builder track record and construction delivery speed',
      'Transparent documentation and property tax registration',
    ],
    author: 'ProBridge Research Desk',
    category: 'Market Analysis',
    readTime: '6 min read',
    createdAt: '2026-03-15T10:00:00Z',
    status: 'published',
  },
  {
    _id: 'blog-2',
    title: 'Luxury Sustainable Homes: The Future of Eco-Friendly Urban Living',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    description: 'Modern luxury is no longer solely defined by opulent chandeliers and marble floorings. Discerning homeowners now prioritize IGBC Green Certified constructions, integrated solar power generation, rainwater harvesting systems, and natural cross-ventilation. Developers are responding by blending bioclimatic architecture with high-end lifestyle amenities that minimize carbon footprint without sacrificing aesthetic elegance.',
    keyfactors: [
      'Zero-discharge water treatment and rainwater recycling',
      'Rooftop solar energy grids reducing electricity overheads',
      'Low-VOC paints and locally sourced non-toxic materials',
      'Smart home energy management and automated climate control',
      'Higher resale valuation for certified green developments',
    ],
    author: 'Ananya Sharma',
    category: 'Architecture & Living',
    readTime: '5 min read',
    createdAt: '2026-03-10T10:00:00Z',
    status: 'published',
  },
  {
    _id: 'blog-3',
    title: 'Commercial vs Residential Real Estate: Which Yields Better ROI?',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    description: 'Deciding between commercial office assets and residential apartments depends heavily on your capital pool, risk tolerance, and investment horizon. While residential investments offer greater liquidity, tax incentives, and lower entry barriers, commercial real estate typically commands rental yields of 7-9% with long-term lease lock-ins and corporate tenants.',
    keyfactors: [
      '7-9% average rental yield on premium commercial properties',
      'Residential properties offer higher liquidity and retail buyer demand',
      'Commercial leases provide longer lock-in periods (3-5 years)',
      'Maintenance responsibilities often borne by commercial tenants',
      'Tax advantages on home loans for residential properties',
    ],
    author: 'Karthik Subramanian',
    category: 'Investment Tips',
    readTime: '7 min read',
    createdAt: '2026-03-05T10:00:00Z',
    status: 'published',
  },
];

export const getBlogs = async () => {
  try {
    const res = await api.get('/blogs');
    if (res.data?.success && Array.isArray(res.data?.blogs || res.data?.results)) {
      return { data: { success: true, blogs: res.data.blogs || res.data.results } };
    }
  } catch (_) {}
  return { data: { success: true, blogs: INITIAL_BLOGS, isDummyFallback: true } };
};

export const getBlogById = async (id) => {
  try {
    const res = await api.get(`/blogs/${id}`);
    if (res.data?.success && res.data?.blog) return res;
  } catch (_) {}
  const found = INITIAL_BLOGS.find(b => b._id === id || b.slug === id);
  return { data: { success: true, blog: found || INITIAL_BLOGS[0], isDummyFallback: true } };
};

// ─── Bridge Guides (from Admin Dashboard) ───────────────────────────────────
export const INITIAL_BRIDGE_GUIDES = [
  {
    _id: 'guide_1',
    id: 'guide_1',
    title: 'The Ultimate RERA & Legal Verification Handbook for Homebuyers',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'ProBridge_RERA_Legal_Handbook_2026.pdf',
    fileSize: '2.4 MB',
    description: 'Comprehensive guide covering RERA compliance checks, encumbrance certificate verification, mother deed validation, and checklist for new property registration.',
    category: 'Legal & Verification',
    status: 'active',
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    _id: 'guide_2',
    id: 'guide_2',
    title: 'First-Time Homebuyer Complete Financial Planning & Tax Guide',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'Homebuyer_Finance_Tax_Guide.pdf',
    fileSize: '1.8 MB',
    description: 'Everything you need to know about down payments, CIBIL score optimization, Section 24(b) & 80C tax deductions, and choosing between fixed vs floating interest rates.',
    category: 'Financial Planning',
    status: 'active',
    createdAt: '2026-03-02T10:00:00Z',
  },
  {
    _id: 'guide_3',
    id: 'guide_3',
    title: 'NRI Real Estate Investment Guide in India: FEMA & Repatriation Rules',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'NRI_Property_Investment_FEMA_Guide.pdf',
    fileSize: '3.1 MB',
    description: 'A complete advisory guide for non-resident Indians on NRE/NRO accounts, Power of Attorney protocols, TDS under Section 195, and funds repatriation guidelines.',
    category: 'NRI Investment',
    status: 'active',
    createdAt: '2026-03-03T10:00:00Z',
  },
];

export const getBridgeGuides = async () => {
  try {
    const res = await api.get('/bridge-guides');
    const list = res.data?.guides || res.data?.results || (Array.isArray(res.data) ? res.data : null);
    if (res.data?.success && Array.isArray(list)) {
      return { data: { success: true, guides: list } };
    }
  } catch (_) {}

  // Check localStorage if admin dashboard placed guides in localStore
  try {
    const stored = localStorage.getItem('probridge_store_bridge_guides') || localStorage.getItem('bridge_guides');
    if (stored) {
      const list = JSON.parse(stored);
      if (Array.isArray(list) && list.length > 0) {
        return { data: { success: true, guides: list.filter(g => g.status !== 'inactive') } };
      }
    }
  } catch (_) {}

  return { data: { success: true, guides: INITIAL_BRIDGE_GUIDES, isDummyFallback: true } };
};

export default api;
