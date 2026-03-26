import axios from 'axios';

const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000') + '/api/v1';

export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error?.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
