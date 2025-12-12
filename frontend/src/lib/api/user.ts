// frontend/lib/api/user.ts
import axios, { AxiosInstance } from "axios";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

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

// ==============================
// CSR (Browser)
// ==============================
const apiClient: AxiosInstance = axios.create({
  baseURL: PUBLIC_API_BASE_URL,
  withCredentials: true,
});

export async function fetchMyProfileClient(): Promise<UserProfile> {
  const response = await apiClient.get("/users/me");
  return response.data?.data;
}

// ==============================
// SSR (Node Runtime)
// ==============================
export async function fetchMyProfileServer(
  cookieHeader: string | undefined
): Promise<{ profile: UserProfile | null; status: number }> {
  const baseUrl = normalizeBaseUrl(PUBLIC_API_BASE_URL);

  const response = await fetch(`${baseUrl}/users/me`, {
    method: "GET",

    // IMPORTANT: Next.js SSR ต้องใช้ "Cookie" (ตัวใหญ่)
    headers: {
      Accept: "application/json",
      ...(cookieHeader && cookieHeader.trim().length > 0
        ? { Cookie: cookieHeader }
        : {}),
    },

    credentials: "include", // ต้องใส่เพื่อให้ cookie ทำงาน
    cache: "no-store", // ป้องกัน fetch จาก cache
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
