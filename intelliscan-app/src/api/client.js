// intelliscan-app/src/api/client.js
import axios from 'axios';
import { clearStoredAuth, getStoredToken } from '../utils/auth';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT token from localStorage or cookie
apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: global 401 handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearStoredAuth();
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith('/sign-')) {
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
