import axios from 'axios';

const API_URL = '/api';
console.log('%c[ADMIN_NEXUS] Primary Logic Link:', 'color: #0ea5e9; font-weight: bold;', API_URL);
console.log('%c[BUILD_VERSION] v2.0.9-DIAGNOSTIC-FIX', 'color: #10b981; font-weight: bold;');

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the JWT token to headers
api.interceptors.request.use(
  (config) => {
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
      const { token } = JSON.parse(adminUser);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: (username, password) => api.post('/api/auth/login', { email: username, password }), // Backend uses email
};

export const eventService = {
  getAll: () => api.get('/api/events/admin/all'),
  getPublic: () => api.get('/api/events'),
  getById: (id) => api.get(`/api/events/${id}`),
  create: (eventData) => api.post('/api/events', eventData),
  update: (id, eventData) => api.put(`/api/events/${id}`, eventData),
  delete: (id) => api.delete(`/api/events/${id}`),
  uploadImage: (formData) => api.post('/api/events/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const bookingService = {
  getAllAttendees: () => api.get('/api/admin/bookings/all'),
  checkIn: (ticketId) => api.post('/api/bookings/check-in', { ticketId }),
};

export default api;
