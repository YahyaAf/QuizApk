import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('exam-auth');
    if (raw) {
      const state = JSON.parse(raw);
      const token = state?.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    // ignore
  }
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/api/auth/')) {
      localStorage.removeItem('exam-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
