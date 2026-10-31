import axios from 'axios';
import { Platform } from 'react-native';

// On Web/Desktop: localhost:4000
// On Android emulator: 10.0.2.2:4000
// On physical devices: configure your computer's local IP
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    const url = process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
    return url.endsWith('/v1') ? url : `${url}/v1`;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000/api/v1';
  }
  return 'http://localhost:4000/api/v1';
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const method = error?.config?.method?.toUpperCase() || 'REQUEST';
    const url = error?.config?.url || '';
    const status = error?.response?.status;
    console.warn(
      `[API Client Error] ${method} ${url}${status ? ` (Status ${status})` : ''}:`,
      error?.message || error,
    );
    return Promise.reject(error);
  },
);
