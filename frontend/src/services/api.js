import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000'; // Your Django backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for session-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add CSRF token to requests (if needed)
api.interceptors.request.use((config) => {
  // Get CSRF token from cookies if using Django's CSRF protection
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  
  return config;
});

export default api;