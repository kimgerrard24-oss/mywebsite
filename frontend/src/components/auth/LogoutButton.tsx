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
    className="
      inline-flex
      items-center
      justify-center
      w-full
      sm:w-auto
      px-4
      sm:px-5
      py-2
      sm:py-2.5
      text-sm
      sm:text-base
      font-medium
      text-white
      bg-red-600
      hover:bg-red-700
      focus:outline-none
      focus-visible:ring-2
      focus-visible:ring-red-500
      focus-visible:ring-offset-2
      disabled:opacity-50
      disabled:cursor-not-allowed
      rounded-md
      sm:rounded-lg
      transition-colors
    "
  >
    {loading ? 'Logging out...' : 'Logout'}
  </button>
);

}
