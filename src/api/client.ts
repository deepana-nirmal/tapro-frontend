import axios, { AxiosError } from 'axios';
import { clearAuthSession, getStoredSession } from '../utils/authStorage';

const developmentApiUrl = 'http://localhost:8080/api';
const configuredApiUrl = process.env.REACT_APP_API_URL?.trim();

export const baseURL = configuredApiUrl || (process.env.NODE_ENV === 'development' ? developmentApiUrl : '');

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
  const { token, user } = getStoredSession();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (user?.restaurantId) {
    config.headers['X-Tenant-ID'] = String(user.restaurantId);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearAuthSession();
    }

    return Promise.reject(error);
  }
);
