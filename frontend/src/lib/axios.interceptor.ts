// frontend/services/axios.interceptor.ts

import { api } from "./api";
import { refreshAccessToken } from "./auth/auth.service";

let isRefreshing = false;
let failedQueue: any[] = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise(function (resolve, reject) {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest._retry = true;
          return api(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshed = await refreshAccessToken();

      isRefreshing = false;
      processQueue(null, refreshed.accessToken);

      return api(originalRequest);
    } catch (err) {
      isRefreshing = false;
      processQueue(err, null);
      return Promise.reject(err);
    }
  }
);
