import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 
                (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
                  ? window.location.origin 
                  : 'http://localhost:5050');

const api = axios.create({
  baseURL: API_URL,
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
  checkStatus: () => api.get('/api'), // Simple health check
};

export const eventService = {
  getAll: () => api.get('/api/events/admin/all'),
  getPublic: () => api.get('/api/events'),
  getById: (id) => api.get(`/api/events/${id}`),
  create: (eventData) => api.post('/api/events', eventData),
  update: (id, eventData) => api.put(`/api/events/${id}`, eventData),
  delete: (id) => api.delete(`/api/events/${id}`),
  uploadImage: (formData) => api.post('/api/events/upload', formData),
};

export default api;
