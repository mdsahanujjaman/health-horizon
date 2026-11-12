
import axios from 'axios';

// Use the current origin so Nginx can route requests to the backend.
export const BASE_URL = '';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getImageUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith('/') ? path : `/${path}`;
};

export default api;
