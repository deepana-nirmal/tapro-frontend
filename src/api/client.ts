import axios, { AxiosError } from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const publicApiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('tapro_token');
  const userJson = localStorage.getItem('tapro_user');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (userJson) {
    try {
      const user = JSON.parse(userJson) as { restaurantId?: number };
      if (user.restaurantId) {
        config.headers['X-Tenant-ID'] = String(user.restaurantId);
      }
    } catch {
      // Ignore malformed local storage state and continue the request.
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tapro_token');
      localStorage.removeItem('tapro_user');
    }

    return Promise.reject(error);
  }
);
