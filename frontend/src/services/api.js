import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dengue-tracker-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dengue-tracker-token');
      localStorage.removeItem('dengue-tracker-user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- EXPORTAÇÕES (Verifique se estão todas aqui) ---

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  profile: () => api.get('/auth/profile'),
};

// ATENÇÃO: Deve ser '/reports' para funcionar com o seu server.js
export const casesAPI = {
  getAll: (params) => api.get('/reports', { params }),
  getById: (id) => api.get(`/reports/${id}`),
  create: (data) => api.post('/reports', data),
  update: (id, data) => api.put(`/reports/${id}`, data),
  delete: (id) => api.delete(`/reports/${id}`),
  getStats: () => api.get('/reports/stats'),
  getTimeline: () => api.get('/reports/timeline'),
  getByRegion: () => api.get('/reports/regions'),
};

export const reportsAPI = {
  generate: (data) => api.post('/reports/export', data),
  download: (id) => api.get(`/reports/${id}/download`, { responseType: 'blob' }),
};

// Esta é a exportação que estava faltando e causava o erro no NotificationContext
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export default api;