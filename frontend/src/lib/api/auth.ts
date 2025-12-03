// frontend/lib/api/auth.ts

import axios from 'axios';

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!API) {
  throw new Error('NEXT_PUBLIC_BACKEND_URL is missing. Please check frontend/.env.production');
}

export async function registerUser(body: {
  email: string;
  username: string;
  password: string;
  turnstileToken: string;
}) {
  const res = await axios.post(`${API}/auth/local/register`, body, {
    withCredentials: true,
  });

  return res.data;
}
