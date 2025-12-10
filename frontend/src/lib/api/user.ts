// frontend/lib/api/user.ts
import axios, { AxiosInstance } from 'axios';

const PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4001';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string; // ISO string from backend
}

/**
 * Axios instance สำหรับฝั่ง client (browser)
 * - baseURL: https://api.phlyphant.com
 * - withCredentials: true เพื่อแนบ cookie (phl_access)
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: PUBLIC_API_BASE_URL,
  withCredentials: true,
});

/**
 * เรียกโปรไฟล์ตัวเองจากฝั่ง client (CSR)
 * ใช้ในหน้า /profile เวลาอยาก refresh ข้อมูล
 */
export async function fetchMyProfileClient(): Promise<UserProfile> {
  const response = await apiClient.get<UserProfile>('/users/me');
  return response.data;
}

/**
 * เรียกโปรไฟล์ตัวเองจากฝั่ง server (SSR)
 * - ใช้ใน getServerSideProps
 * - แนบ cookie จาก request header ของผู้ใช้
 */
export async function fetchMyProfileServer(cookieHeader: string | undefined): Promise<{
  profile: UserProfile | null;
  status: number;
}> {
  // ฝั่ง server พยายามใช้ INTERNAL_BACKEND_URL ก่อน (Docker -> Backend)
  const baseUrl =
    process.env.INTERNAL_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:4001';

  const response = await axios.get<UserProfile>(`${baseUrl}/users/me`, {
    headers: {
      // forward cookie จาก browser ไปให้ backend ตรวจ phl_access
      cookie: cookieHeader ?? '',
    },
    // ให้ axios คืน response มาแม้ status เป็น 4xx (จะได้เช็คเอง)
    validateStatus: () => true,
    withCredentials: true,
  });

  if (response.status >= 200 && response.status < 300) {
    return { profile: response.data, status: response.status };
  }

  return { profile: null, status: response.status };
}
