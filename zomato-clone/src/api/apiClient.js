import axios from 'axios';

// Dynamically select base API URL:
// 1. Explicit VITE_API_URL if configured
// 2. Default to relative '' so /api routes directly:
//    - Locally: Vite proxies /api to http://localhost:5001
//    - On Vercel: Vercel serverless function handles /api on the same domain
const baseURL = import.meta.env.VITE_API_URL || '';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Automatically inject JWT Bearer token into requests if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle expired/invalid tokens
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired credentials from storage
      const hadToken = Boolean(localStorage.getItem('token'));
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Dispatch a storage event to keep tabs/contexts in sync if needed
      if (hadToken) {
        window.dispatchEvent(new Event('storage'));
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
