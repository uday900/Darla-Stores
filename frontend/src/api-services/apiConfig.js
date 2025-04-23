import axios from 'axios';
import { toast } from 'react-toastify';

// export const API_URL = 'http://localhost:8080';
export const API_URL = import.meta.env.VITE_BACKEND_API;
const api = axios.create({
  baseURL: API_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
});

// Request interceptor to add auth token
api.interceptors.request.use(
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

// let isSessionExpiredHandled = false; // Flag to track logout
// let isSessionExpired = localStorage.getItem('isSessionExpired') === 'true';
var isSessionExpired = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // const token = localStorage.getItem('token');
    if (error.response?.status === 401 && !isSessionExpired) {
      isSessionExpired = true;
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('user');
      localStorage.clear();

      toast.error('Session expired. Please log in again.');

      // Redirect after short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    }

    return Promise.reject(error);
  }
);



export default api; 