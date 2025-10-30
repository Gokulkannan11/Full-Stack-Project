import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    return response.data;
  },
  vendorRegister: async (userData) => {
    const response = await API.post('/auth/vendor/register', userData);
    return response.data;
  },
  vendorLogin: async (credentials) => {
    const response = await API.post('/auth/vendor/login', credentials);
    return response.data;
  },
  forgotPassword: async (email) => {
    const response = await API.post('/auth/forgot-password', { email });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },
};

// Daycare API - UPDATED with new endpoints
export const daycareAPI = {
  createBooking: async (bookingData) => {
    const response = await API.post('/daycare/bookings', bookingData);
    return response.data;
  },
  getBookings: async (searchKeyword = '') => {
    const params = searchKeyword ? { search: searchKeyword } : {};
    const response = await API.get('/daycare/bookings', { params });
    return response.data;
  },
  updateBooking: async (bookingId, bookingData) => {
    const response = await API.put(`/daycare/bookings/${bookingId}`, bookingData);
    return response.data;
  },
  cancelBooking: async (bookingId) => {
    const response = await API.patch(`/daycare/bookings/${bookingId}/cancel`);
    return response.data;
  },
  deleteBooking: async (bookingId) => {
    const response = await API.delete(`/daycare/bookings/${bookingId}`);
    return response.data;
  },
};

// Products API
export const productsAPI = {
  createOrder: async (orderData) => {
    const response = await API.post('/products/orders', orderData);
    return response.data;
  },
  getOrders: async () => {
    const response = await API.get('/products/orders');
    return response.data;
  },
  updateOrderAddress: async (orderId, shippingAddress) => {
    const response = await API.put(`/products/orders/${orderId}/address`, { shippingAddress });
    return response.data;
  },
  cancelOrder: async (orderId) => {
    const response = await API.patch(`/products/orders/${orderId}/cancel`);
    return response.data;
  },
  deleteOrder: async (orderId) => {
    const response = await API.delete(`/products/orders/${orderId}`);
    return response.data;
  },
};

// Adoption API
export const adoptionAPI = {
  createApplication: async (applicationData) => {
    const response = await API.post('/adoption/applications', applicationData);
    return response.data;
  },
  getApplications: async () => {
    const response = await API.get('/adoption/applications');
    return response.data;
  },
  updateApplication: async (applicationId, applicationData) => {
    const response = await API.put(`/adoption/applications/${applicationId}`, applicationData);
    return response.data;
  },
  revokeApplication: async (applicationId) => {
    const response = await API.patch(`/adoption/applications/${applicationId}/revoke`);
    return response.data;
  },
  deleteApplication: async (applicationId) => {
    const response = await API.delete(`/adoption/applications/${applicationId}`);
    return response.data;
  },
};

// Profile API
export const profileAPI = {
  getProfile: async () => {
    const response = await API.get('/profile');
    return response.data;
  },
  createProfile: async (profileData) => {
    const response = await API.post('/profile', profileData);
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await API.put('/profile', profileData);
    return response.data;
  },
  deleteProfile: async () => {
    const response = await API.delete('/profile');
    return response.data;
  },
};

// Vendor Profile API
export const vendorProfileAPI = {
  getProfile: async () => {
    const response = await API.get('/vendor-profile');
    return response.data;
  },
  createProfile: async (profileData) => {
    const response = await API.post('/vendor-profile', profileData);
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await API.put('/vendor-profile', profileData);
    return response.data;
  },
  deleteProfile: async () => {
    const response = await API.delete('/vendor-profile');
    return response.data;
  },
};

// Pets API
export const petsAPI = {
  getBreeds: async (category) => {
    const response = await API.get(`/pets/breeds/${category}`);
    return response.data;
  },
  getPets: async () => {
    const response = await API.get('/pets');
    return response.data;
  },
  getPet: async (id) => {
    const response = await API.get(`/pets/${id}`);
    return response.data;
  },
  createPet: async (petData) => {
    const response = await API.post('/pets', petData);
    return response.data;
  },
  updatePet: async (id, petData) => {
    const response = await API.put(`/pets/${id}`, petData);
    return response.data;
  },
  deletePet: async (id) => {
    const response = await API.delete(`/pets/${id}`);
    return response.data;
  },
};

export default API;