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

let redirectingToLogin = false;

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== 'undefined' &&
      error?.response?.status === 401 &&
      !redirectingToLogin
    ) {
      redirectingToLogin = true;
      window.location.replace('/login');
      // Reset after navigation so the guard works again on re-login
      setTimeout(() => {
        redirectingToLogin = false;
      }, 3000);
    }
    return Promise.reject(error);
  },
);
