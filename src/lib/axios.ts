import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  // In development, use empty baseURL to let Vite proxy handle routing
  // In production, use VITE_API_URL
  baseURL: import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || ''),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically add JWT token
api.interceptors.request.use(
  (config) => {
    // Try all possible storage keys - UserContext uses 'token'
    const token = localStorage.getItem('token') || 
                  sessionStorage.getItem('authToken') || 
                  localStorage.getItem('authToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug: Log outgoing requests with auth status
    console.log('🔐 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      hasAuth: !!token,
      token: token ? `${token.substring(0, 20)}...` : 'none'
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized responses
    if (error.response?.status === 401) {
      console.warn('🚫 401 Unauthorized - Token may be expired');
      
      // Clear stored tokens
      sessionStorage.removeItem('authToken');
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
      
      // Redirect to login page or show auth modal
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    
    return Promise.reject(error);
  }
);

export default api;
