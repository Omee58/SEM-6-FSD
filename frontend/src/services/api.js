import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api' });

API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Unwrap { success, message, data: {...} } → res.data becomes the inner data object
API.interceptors.response.use(
  res => {
    if (res.data && typeof res.data === 'object' && 'success' in res.data && 'data' in res.data) {
      res.data = res.data.data;
    }
    return res;
  },
  err => Promise.reject(err)
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  updatePassword: (data) => API.put('/auth/password', data),
  uploadProfilePhoto: (formData) => API.put('/auth/profile-photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadCoverImage: (formData) => API.put('/auth/cover-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Client
export const clientAPI = {
  getServices: (params) => API.get('/client/services', { params }),
  getVendorProfile: (vendorId) => API.get(`/client/vendors/${vendorId}`),
  bookService: (data) => API.post('/client/bookings', data),
  getBookings: () => API.get('/client/bookings'),
  cancelBooking: (id) => API.patch(`/client/bookings/${id}/cancel`),
};

// Vendor
export const vendorAPI = {
  getProfile: () => API.get('/vendor/profile'),
  getEarnings: () => API.get('/vendor/earnings'),
  getAvailability: (params) => API.get('/vendor/availability', { params }),
  toggleBlockDate: (data) => API.patch('/vendor/availability/block', data),
  getBookingRequests: () => API.get('/vendor/bookings/requests'),
  getAllBookings: () => API.get('/vendor/bookings'),
  changeBookingStatus: (id, status) => API.patch(`/vendor/bookings/${id}/status`, { status }),
  getMyServices: () => API.get('/vendor/services/mine'),
  getServiceById: (id) => API.get(`/vendor/services/${id}`),
  addService: (formData) => API.post('/vendor/services', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateService: (id, formData) => API.put(`/vendor/services/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteService: (id) => API.delete(`/vendor/services/${id}`),
};

// Admin
export const adminAPI = {
  getStats:          (params)     => API.get('/admin/stats', { params }),
  getVendorRequests: ()           => API.get('/admin/vendor-requests'),
  acceptVendor:      (id)         => API.patch(`/admin/vendor-requests/${id}/accept`),
  rejectVendor:      (id, reason) => API.patch(`/admin/vendor-requests/${id}/reject`, { reason }),
  getAllUsers:        (params)     => API.get('/admin/users',    { params }),
  getAllBookings:     (params)     => API.get('/admin/bookings', { params }),
  // new pages
  getReviews:        (params)     => API.get('/admin/reviews',  { params }),
  deleteReview:      (id)         => API.delete(`/admin/reviews/${id}`),
};

// Reviews
export const reviewAPI = {
  getServiceReviews: (serviceId) => API.get(`/reviews/${serviceId}`),
  addReview: (serviceId, data) => API.post(`/reviews/${serviceId}`, data),
  getReviewableBookings: () => API.get('/reviews/my-reviewable'),
};

export default API;
