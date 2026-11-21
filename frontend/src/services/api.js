import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─€─€ Auth ─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€
export const login         = (data) => api.post('/auth/login', data);
export const register      = (data) => api.post('/auth/register', data);
export const getMe         = ()     => api.get('/auth/me');
export const updateProfile = (data) => api.patch('/auth/profile', data);
export const sendPhoneOtp  = (data) => api.post('/auth/send-otp', data);
export const phoneLogin    = (data) => api.post('/auth/phone-login', data);

// ─€─€ Properties ─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€
export const getProperties       = (params) => api.get('/properties', { params });
export const getProperty         = (id)     => api.get(`/properties/${id}`);
export const createProperty      = (data)   => api.post('/properties', data);
export const deleteProperty      = (id)     => api.delete(`/properties/${id}`);
export const getMyListings       = ()       => api.get('/properties/my/listings');
export const getCityCounts       = ()       => api.get('/properties/city-counts');
export const getCategoryCounts   = ()       => api.get('/properties/category-counts');
export const getBuilderCounts    = ()       => api.get('/properties/builder-counts');

// ─€─€ Search ─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€
export const searchProperties    = (params) => api.get('/search', { params });
export const searchCities        = (q)      => api.get('/search/cities', { params: { q } });
export const searchLocalities    = (params) => api.get('/search/localities', { params });

// ─€─€ Filters ─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€
export const getFilters          = ()       => api.get('/filters');

// ─€─€ Saved ─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€
export const getSaved            = ()         => api.get('/saved');
export const toggleSaved         = (propertyId) => api.post('/saved/toggle', { propertyId });

// ─€─€ Enquiries ─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€
export const sendEnquiry         = (data)   => api.post('/enquiries', data);
export const getMyEnquiries      = ()       => api.get('/enquiries/my');

// ─€─€ Ads / Sponsored Banners ─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€
export const getActiveAds        = ()       => api.get('/ads/active');
export const trackAdClick        = (id)     => api.post(`/ads/${id}/click`);

// ─€─€ Standalone Website Top Banners (Search Bar Top) ─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€
export const getTopBanners       = ()       => api.get('/top-banners');
export const getBuilders         = ()       => api.get('/builders');
export const trackTopBannerClick = (id)     => api.post(`/top-banners/${id}/click`);

// ─€─€ Upload ─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};


// ── Careers ───────────────────────────────────────────────────────────────────
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

export default api;


