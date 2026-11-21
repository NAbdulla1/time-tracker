import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5050/api' : '/api'),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const storedTz = localStorage.getItem('user_timezone');
  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  config.headers['X-Timezone'] = storedTz || browserTz;
  return config;
});

export default api;
