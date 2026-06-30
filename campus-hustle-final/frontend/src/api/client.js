import axios from 'axios';

// This looks for the Vercel Environment Variable we set: REACT_APP_API_URL
// If not found, it defaults to your live Render backend URL
const BASE_URL = process.env.REACT_APP_API_URL || 'https://hustlegrad.onrender.com';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 60_000,
  headers: { 
    'Content-Type': 'application/json' 
  },
  // Ensure cookies/tokens are sent with cross-origin requests
  withCredentials: true, 
});

// ── Request interceptor: attach JWT if present ──────────────────────────────
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: normalise errors ───────────────────────────────────
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred.';
    const normalized = new Error(message);
    normalized.status = error.response?.status;

    // Handle 401 Unauthorized globally
    if (normalized.status === 401 && !error.config.url?.includes('/auth/')) {
      window.dispatchEvent(new CustomEvent('hustlegrad:unauthorized', { detail: { message } }));
    }

    return Promise.reject(normalized);
  }
);

export default client;