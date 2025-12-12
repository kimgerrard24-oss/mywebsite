// frontend/lib/api/user.ts
import axios, { AxiosInstance } from 'axios';

// Normalize function เพื่อป้องกัน baseURL ลงท้ายด้วย '/'
function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

// โหลดค่าจาก ENV
const PUBLIC_API_BASE_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://api.phlyphant.com"
);

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Axios instance สำหรับฝั่ง client (browser)
 * - withCredentials: true เพื่อส่ง cookie phl_access
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: PUBLIC_API_BASE_URL,
  withCredentials: true,
});

/**
 * CSR: เรียกโปรไฟล์ตัวเองจากฝั่ง client
 * Backend response = { success, statusCode, data }
 */
export async function fetchMyProfileClient(): Promise<UserProfile> {
  const response = await apiClient.get('/users/me');
  return response.data?.data;
}

/**
 * SSR: เรียกโปรไฟล์ตัวเองพร้อมส่ง cookie จาก request header
 */
export async function fetchMyProfileServer(
  cookieHeader: string | undefined
): Promise<{
  profile: UserProfile | null;
  status: number;
}> {
  const baseUrl = normalizeBaseUrl(
    process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE ||
      "https://api.phlyphant.com"
  );

  const response = await fetch(`${baseUrl}/users/me`, {
    method: "GET",
    headers: {
      cookie: cookieHeader ?? "",
      Accept: "application/json",
    }
  });

  const status = response.status;

  if (status >= 200 && status < 300) {
    const json = await response.json().catch(() => null);
    return {
      profile: json?.data ?? null,
      status,
    };
  }

  return { profile: null, status };
}
