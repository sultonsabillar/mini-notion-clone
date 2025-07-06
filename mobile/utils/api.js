import axios from 'axios';

// Create axios instance with base URL pointing to your backend
const api = axios.create({
  baseURL: 'http://192.168.2.41:3000', // Change this to your backend IP
  timeout: 10000,
  withCredentials: true, // For cookies
});

// Request interceptor to add auth headers if needed
api.interceptors.request.use(
  (config) => {
    // You can add auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors here
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      // You can implement navigation logic here
    }
    return Promise.reject(error);
  }
);

export default api; 