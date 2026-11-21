import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5050/api' : '/api'),
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
