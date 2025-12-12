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

// CSR client axios
const apiClient: AxiosInstance = axios.create({
  baseURL: PUBLIC_API_BASE_URL,
  withCredentials: true,
});

// CSR: เรียกโปรไฟล์ตัวเอง
export async function fetchMyProfileClient(): Promise<UserProfile> {
  const response = await apiClient.get('/users/me');
  return response.data?.data;
}

// SSR: เรียกโปรไฟล์ด้วย cookie จาก req.headers.cookie
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
      // FIX 1 — ห้ามใช้ "" เพราะ backend มองว่าเป็น invalid cookie
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      Accept: "application/json",
    },
    // FIX 2 — ให้ SSR ส่ง cookie ข้าม domain
    credentials: "include",
    // FIX 3 — ป้องกัน SSR cache
    cache: "no-store",
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
