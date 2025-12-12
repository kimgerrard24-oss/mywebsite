// ==============================
// src/hooks/useAuth.ts
// ==============================
"use client";

import { useEffect, useState, useContext } from "react";
import { api } from "@/lib/api/api"; // FIXED
import type { User } from "@/types/index";
import { AuthContext } from "@/context/AuthContext";

// Normalize backend URL
const rawBase =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://api.phlyphant.com";

const API_BASE = rawBase.replace(/\/+$/, "");

// ========================================
// Added: useAuth() mapping from AuthContext
// ========================================
export function useAuth() {
  const ctx = useContext(AuthContext);
  return ctx;
}

// ==============================
// Internal hook logic (Hybrid Auth)
// ==============================
export function useAuthInternal() {
  const [user, setUser] = useState<Partial<User> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        // ---------------------------------------------
        // 1) Local Auth (JWT Cookie → Redis session)
        // ---------------------------------------------
        const me = await api.get("/users/me", {
          validateStatus: () => true,
        });

        if (me.status >= 200 && me.status < 300) {
          if (!mounted) return;
          setUser(me.data);
          return;
        }

        // ---------------------------------------------
        // 2) Social login fallback (session-check)
        // ---------------------------------------------
        const res = await api.get("/auth/session-check");

        if (!mounted) return;

        const data = res.data || {};
        const valid = data.valid === true;

        if (valid) {
          const decoded = data.decoded || {};
          const backendUser = data.user || null;

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

  // ---------------------------------------------
  // logout → backend clears session cookie
  // ---------------------------------------------
  const signOut = async () => {
    try {
      await api.post("/auth/local/logout", {});
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
