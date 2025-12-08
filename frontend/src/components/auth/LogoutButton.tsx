// ===========================================
// file: components/auth/LogoutButton.tsx
// ===========================================

"use client";

import React, { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const rawBase =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://api.phlyphant.com";

const API_BASE = rawBase.replace(/\/+$/, "");

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;

    setLoading(true);

    try {
      await axios.post(
        `${API_BASE}/auth/local/logout`,
        {},
        {
          withCredentials: true,
        }
      );
    } catch {
      // silently ignore, still redirect user
    } finally {
      setLoading(false);
      router.push("/");
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      aria-disabled={loading}
      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition"
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}
