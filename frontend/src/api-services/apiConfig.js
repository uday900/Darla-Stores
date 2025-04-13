import axios from 'axios';
import { toast } from 'react-toastify';

export const API_URL = 'http://localhost:8080';

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

let isSessionExpiredHandled = false; // Flag to track logout

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isSessionExpiredHandled) {
      isSessionExpiredHandled = true; // Set the flag to true

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


// Response interceptor to handle token expiration
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Token expired or invalid
//       localStorage.removeItem('token');
//       localStorage.removeItem('isAuthenticated');
//       localStorage.removeItem('isAdmin');
//       localStorage.removeItem('user');
//       toast.error('Session expired. Please log in again.');
//       // redirect to login after 2 seconds
//       // setTimeout(() => {
//       //   window.location.href = '/login';
//       // }, 2000);
//       // window.location.href = '/login'; // Redirect to login page
//     }
//     return Promise.reject(error);
//   }
// );

export default api; 