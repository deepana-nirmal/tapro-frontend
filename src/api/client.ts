import axios, { AxiosError } from 'axios';

const developmentApiUrl = 'http://localhost:8080/api';
const configuredApiUrl = process.env.REACT_APP_API_URL?.trim();

export const baseURL = configuredApiUrl || (process.env.NODE_ENV === 'development' ? developmentApiUrl : '');

console.log("API baseURL", baseURL);

if (!configuredApiUrl && process.env.NODE_ENV !== 'development') {
  // Production deployments must inject REACT_APP_API_URL so the frontend talks to the deployed backend.
  // An empty base URL avoids silently falling back to localhost in production builds.
  // eslint-disable-next-line no-console
  console.error('REACT_APP_API_URL is required for non-development builds.');
}

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
