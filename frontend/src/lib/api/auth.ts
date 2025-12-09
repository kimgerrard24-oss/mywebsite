// frontend/lib/api/auth.ts

import axios, { AxiosError } from 'axios';

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

// Request password reset
export interface ApiSuccessResponse {
  message: string;
}

export interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export async function requestPasswordReset(email: string): Promise<string> {
  try {
    const response = await axios.post<ApiSuccessResponse>(
      `${baseURL}/auth/local/request-password-reset`,
      { email },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: false,
      },
    );

    if (response.data?.message) {
      return response.data.message;
    }

    return 'If an account exists for this email, a password reset link has been sent.';
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }

    throw new Error(
      'Unable to process your request at the moment. Please try again later.',
    );
  }
}
