// ==============================
// src/hooks/useAuth.ts
// ==============================
"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import type { User } from "@/types/index";

// FIX: normalize API base URL
const rawBase =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://api.phlyphant.com";

const API_BASE = rawBase.replace(/\/+$/, "");

export function useAuth() {
  const [user, setUser] = useState<Partial<User> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await axios.get(`${API_BASE}/auth/session-check`, {
          withCredentials: true,
        });

        if (!mounted) return;

        const data = res.data || {};
        const valid = data.valid === true;

        if (valid) {
          const decoded = data.decoded || {};

          const uid = decoded.user_id ? String(decoded.user_id) : undefined;
          const email = decoded.email || undefined;

          setUser({
            id: uid,
            email: email,
            username: email ? email.split("@")[0] : "unknown",
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [API_BASE]);

  const updateUser = (u: Partial<User> | null) => setUser(u);

  const signOut = async () => {
    try {
      await axios.post(
        `${API_BASE}/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.warn("Backend logout error", err);
    }

    setUser(null);
  };

  return {
    user,
    updateUser,
    loading,
    signOut,
  };
}
