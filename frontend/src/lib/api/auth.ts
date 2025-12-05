// frontend/lib/api/auth.ts

import axios from 'axios';

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!API) {
  throw new Error('NEXT_PUBLIC_BACKEND_URL is missing. Please check frontend/.env.production');
}

// Normalize base URL
const baseURL = API.replace(/\/+$/, '');

const client = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000, // 10 seconds safety
});

// Register user
export async function registerUser(body: {
  email: string;
  username: string;
  password: string;
  turnstileToken: string;
}) {
  const res = await client.post('/auth/local/register', body);
  return res.data;
}

// Verify email
export async function verifyEmail(token: string) {
  const encodedToken = encodeURIComponent(token);
  const res = await client.get(`/auth/local/verify-email?token=${encodedToken}`);
  return res.data;
}
