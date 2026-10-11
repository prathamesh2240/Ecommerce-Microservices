import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL !== undefined ? import.meta.env.VITE_API_BASE_URL : '',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ─── Request Interceptor ───────────────────────────────────────────────────────
// Attach JWT token to every request that is not public
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ──────────────────────────────────────────────────────
// Centralized error handling mapping backend status codes to user-friendly messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const backendMessage = error.response?.data?.message;

    const errorMessages = {
      400: backendMessage || 'Invalid request. Please check your input.',
      401: 'Your session has expired. Please login again.',
      // 403: use the actual backend message — it contains meaningful context
      // (e.g. "Access denied: You can only view your own profile")
      403: backendMessage || 'You do not have permission to perform this action.',
      404: backendMessage || 'Resource not found.',
      409: backendMessage || 'This resource already exists.',
      500: 'Something went wrong on our end. Please try again.',
      503: 'Service temporarily unavailable. Please try again shortly.',
    };

    const message = errorMessages[status] || backendMessage || 'An unexpected error occurred.';

    // Auto-logout on 401
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Use window.location to avoid circular dependency with router
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    const enhancedError = new Error(message);
    enhancedError.status = status;
    enhancedError.data = error.response?.data;
    enhancedError.originalError = error;
    return Promise.reject(enhancedError);
  }
);

export default api;
