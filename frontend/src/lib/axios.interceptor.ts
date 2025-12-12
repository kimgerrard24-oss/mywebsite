// frontend/services/axios.interceptor.ts

import { api } from "./api/api";
import { refreshAccessToken } from "./auth/auth.service";

let isRefreshing = false;
let failedQueue: any[] = [];

function processQueue(error: any) {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(true);
  });

  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // ไม่ใช่ 401 หรือเคย retry แล้ว → reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          originalRequest._retry = true;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshed = await refreshAccessToken(); // boolean

      isRefreshing = false;

      if (!refreshed) {
        processQueue(new Error("Failed to refresh token"));
        return Promise.reject(error);
      }

      processQueue(null);
      return api(originalRequest);

    } catch (err) {
      isRefreshing = false;
      processQueue(err);
      return Promise.reject(err);
    }
  }
);
