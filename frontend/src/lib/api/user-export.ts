// frontend/src/lib/api/user-export.ts

// ==============================
// Profile Export API (CSR)
// ==============================

import { api } from "./api";

export async function exportMyProfile(): Promise<Blob> {
  const res = await api.get("/users/me/profile/export", {
    responseType: "blob",
    withCredentials: true,
  });

  return res.data as Blob;
}
