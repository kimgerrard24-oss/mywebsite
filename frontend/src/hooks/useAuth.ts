// ==============================
// src/hooks/useAuth.ts
// FIXED — ปลอดภัย, ไม่ชนกับ AuthContext, ใช้ข้อมูลถูกต้อง
// ==============================
"use client";

import { useEffect, useState, useContext } from "react";
import { api } from "@/lib/api/api";
import type { User } from "@/types/index";
import { AuthContext } from "@/context/AuthContext";

// Normalize backend URL
const rawBase =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://api.phlyphant.com";

const API_BASE = rawBase.replace(/\/+$/, "");

// ========================================
// Public hook → ใช้ AuthContext เป็นแหล่งข้อมูลหลัก
// ========================================
export function useAuth() {
  const ctx = useContext(AuthContext);
  return ctx;
}

// Internal type เพื่อรองรับ avatar ได้
type InternalAuthUser = {
  id?: string;
  email?: string;
  username?: string;
  avatar?: string;
  provider?: string;
};

// ========================================
// INTERNAL HOOK (Passive Mode)
// ไม่ override AuthContext.user
// ใช้เฉพาะเมื่อบางหน้าเลือกเรียกมันเองเท่านั้น
// ========================================
export function useAuthInternal() {
  const authCtx = useContext(AuthContext);

  // FIX: ป้องกันกรณี AuthContext undefined
  if (!authCtx) {
    return {
      user: null,
      updateUser: () => {},
      loading: false,
      signOut: async () => {},
    };
  }

  // ถ้ามี AuthContext.user → ใช้ข้อมูลนั้นก่อน
  const [user, setUser] = useState<InternalAuthUser | null>(
    authCtx.user ? (authCtx.user as InternalAuthUser) : null
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

  async function load() {
  // FIX: ป้องกัน TS — authCtx อาจเป็น undefined
  if (!authCtx) {
    setUser(null);
    setLoading(false);
    return;
  }

  // ถ้า AuthContext ยังโหลด → ห้ามยิงซ้ำ
  if (authCtx.loading) {
    setLoading(true);
    return;
  }

  // ถ้า AuthContext มี user อยู่แล้ว → ใช้เลย
  if (authCtx.user) {
    setUser(authCtx.user as InternalAuthUser);
    setLoading(false);
    return;
  }

      try {
        // ---------------------------------------------
        // 1) LOCAL AUTH (JWT Cookie → Redis)
        // ---------------------------------------------
        const me = await api.get("/users/me", {
          validateStatus: () => true,
        });

        if (!mounted) return;

        if (me.status >= 200 && me.status < 300) {
          // backend ส่ง user object ตรงๆ
          const localUser = me.data || null;

          setUser(localUser);
          setLoading(false);
          return;
        }

        // ---------------------------------------------
        // 2) SOCIAL LOGIN FALLBACK
        // ---------------------------------------------
        const res = await api.get("/auth/session-check", {
          validateStatus: () => true,
        });

        if (!mounted) return;

        const data = res.data || {};
        const valid = data.valid === true;

        if (valid) {
          const backendUser = data.user || {};

          const builtUser: InternalAuthUser = {
            id: backendUser.id,
            email: backendUser.email,
            username: backendUser.email
              ? backendUser.email.split("@")[0]
              : "unknown",
            avatar:
              backendUser.avatarUrl ||
              backendUser.avatar ||
              "/images/default-avatar.png",
          };

          setUser(builtUser);
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
  }, [authCtx.user, authCtx.loading, API_BASE]);

  const updateUser = (u: InternalAuthUser | null) => setUser(u);

  // logout → backend ลบ JWT cookies
  const signOut = async () => {
    try {
      await api.post("/auth/local/logout", {});
    } catch (err) {
      console.warn("Backend logout error:", err);
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
