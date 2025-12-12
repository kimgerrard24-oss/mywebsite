// ==============================
// frontend/services/axios.interceptor.ts
// FIXED & SAFE VERSION
// ==============================

import { api } from "./api/api";
import { refreshAccessToken } from "./auth/auth.service";

let isRefreshing = false;

let failedQueue: Array<{
  resolve: (value: boolean) => void;
  reject: (reason?: any) => void;
}> = [];

// ปลอดภัยกว่า: resolve(value) เพื่อบอกว่า refresh สำเร็จ
function processQueue(error: any, value: boolean = false) {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(value);
  });

  failedQueue = [];
}

// ประกาศ field `_retry` เพิ่มเองบน AxiosRequestConfig
declare module "axios" {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // ไม่ใช่ 401 → ปล่อยผ่าน
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // ถ้ากำลัง refresh อยู่ → queue ไว้
    if (isRefreshing) {
      return new Promise<boolean>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          originalRequest._retry = true;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // เริ่ม refresh ใหม่
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshed = await refreshAccessToken(); // boolean
      isRefreshing = false;

      if (!refreshed) {
        processQueue(new Error("Failed to refresh token"), false);
        return Promise.reject(error);
      }

      // resolve request ทั้งหมดที่รออยู่
      processQueue(null, true);

      return api(originalRequest);
    } catch (err) {
      isRefreshing = false;
      processQueue(err, false);
      return Promise.reject(err);
    }
  }
);
