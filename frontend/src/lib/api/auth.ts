// frontend/lib/api/auth.ts

import axios from 'axios';

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function registerUser(body: {
  email: string;
  username: string;
  password: string;
}) {
  const res = await axios.post(`${API}/auth/local/register`, body, {
    withCredentials: true,   // สำคัญมาก
  });

  return res.data;
}

