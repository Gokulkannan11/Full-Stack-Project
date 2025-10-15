import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
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

export const authAPI = {
  register: (userData) => API.post('/auth/register', userData),
  login: (credentials) => API.post('/auth/login', credentials),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  getCurrentUser: () => API.get('/auth/me'),
};

export const daycareAPI = {
  createBooking: (bookingData) => API.post('/daycare/bookings', bookingData),
  getBookings: () => API.get('/daycare/bookings'),
};

export const productsAPI = {
  createOrder: (orderData) => API.post('/products/orders', orderData),
  getOrders: () => API.get('/products/orders'),
};

export const adoptionAPI = {
  createApplication: (applicationData) => API.post('/adoption/applications', applicationData),
  getApplications: () => API.get('/adoption/applications'),
};

export default API;