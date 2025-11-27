// ==============================
// src/hooks/useAuth.ts
// Support: Hybrid OAuth + Firebase CustomToken + Backend Session Cookie
// ==============================
"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import type { User } from "@/types/index";

// Normalize backend URL
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
          const backendUser = data.user || null;

          // Build dynamic user object
          const builtUser = {
            id:
              backendUser?.id ||
              decoded.user_id ||
              decoded.uid ||
              undefined,

            email:
              backendUser?.email ||
              decoded.email ||
              undefined,

            username: (backendUser?.email || decoded.email)
              ? (backendUser?.email || decoded.email).split("@")[0]
              : "unknown",

            provider:
              backendUser?.provider ||
              decoded.firebase?.sign_in_provider ||
              decoded.sign_in_provider ||
              undefined,

            avatar:
              backendUser?.avatar ||
              backendUser?.picture ||
              backendUser?.picture_url ||
              decoded.picture ||
              "/images/default-avatar.png",
          };

          // FIX: allow dynamic fields via type cast
          setUser(builtUser as Partial<User>);
        } else {
          setUser(null);
        }
      } catch {
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
