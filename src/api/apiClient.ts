import axios from 'axios';

const apiClient = axios.create({
  baseURL:  'https://951f-202-79-184-241.ngrok-free.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;