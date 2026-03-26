import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send HttpOnly cookies on every request
  headers: {
    'Content-Type': 'application/json',
  },
});
