import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: 'https://scraping-api-w0za.onrender.com',
  withCredentials: true,
  timeout: 5000, // 5 second timeout
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is a network error
     // Check if it's a network error (could be connection issues or server sleeping)
     if (error.code === 'ERR_NETWORK') {
      // If we already retried 3 times, don't retry further and reject
      if (originalRequest._retry && originalRequest._retry >= 3) {
        // Show the toast only once when it fails after retrying
        toast.error('Unable to connect to server. Please check your connection.');
        return Promise.reject(error); // Reject the request after 3 retries
      }

      // If this is the first retry attempt, mark it
      if (!originalRequest._retry) {
        originalRequest._retry = 1;
      } else {
        originalRequest._retry++;
      }

      // Show the error toast on the first failed attempt only
      if (originalRequest._retry === 1) {
        toast.error('Unable to connect to server. Retrying...');
      }

      // Wait for 1 second before retrying (can increase the delay between retries)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Retry the original request
      return api(originalRequest);
    }

    // If the error is a 401 (Unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // If the error is a 403 (Forbidden)
    if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action');
      return Promise.reject(error);
    }

    // For all other errors
    toast.error(error.response?.data?.message || 'An error occurred');
    return Promise.reject(error);
  }
);

export default api; 