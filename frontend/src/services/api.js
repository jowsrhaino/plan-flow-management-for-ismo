import axios from 'axios';

const rawBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const apiBaseUrl = rawBaseUrl
  ? rawBaseUrl.endsWith('/api')
    ? rawBaseUrl
    : `${rawBaseUrl}/api`
  : '/api';

// API Instance உருவாக்கம்
const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: ஒவ்வொரு API அழைப்பிலும் JWT Token-ஐ தானாக Header-ல் இணைத்தல்
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Token காலாவதியானால் (401 Error) தானாக லாகின் பக்கத்திற்கு அனுப்புதல்
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;