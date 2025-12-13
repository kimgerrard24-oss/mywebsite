// ==============================
// src/hooks/useAuth.ts
// FIXED — แก้ auth state ชนกัน
// ไม่กระทบ social login
// ==============================
"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";

// ========================================
// Public hook → ใช้ AuthContext เป็นแหล่งข้อมูลหลัก
// ========================================
export function useAuth() {
  return useContext(AuthContext);
}

// Internal type สำหรับ UI เท่านั้น
type InternalAuthUser = {
  id?: string;
  email?: string;
  username?: string;
  avatar?: string;
  provider?: string;
};

// ========================================
// INTERNAL HOOK (Passive / UI Helper)
// - ไม่ยิง API
// - ไม่ตัดสิน auth
// - ไม่ override AuthContext
// - ไม่แตะ social login
// ========================================
export function useAuthInternal() {
  const authCtx = useContext(AuthContext);

  // ป้องกันกรณีถูกเรียกนอก Provider
  if (!authCtx) {
    return {
      user: null,
      updateUser: () => {},
      loading: false,
      signOut: async () => {},
    };
  }

  const [user, setUser] = useState<InternalAuthUser | null>(null);

  // sync state จาก AuthContext เท่านั้น
  useEffect(() => {
    if (authCtx.loading) return;

    if (authCtx.user) {
      setUser({
        ...authCtx.user,
        username:
          authCtx.user.email?.split("@")[0] ??
          authCtx.user.displayName ??
          "",
      });
    } else {
      setUser(null);
    }
  }, [authCtx.user, authCtx.loading]);

  // สำหรับ UI ที่ต้องปรับ state ชั่วคราว (เช่น preview avatar)
  const updateUser = (u: InternalAuthUser | null) => {
    setUser(u);
  };

  // logout → เรียก backend เท่านั้น (ไม่ยุ่ง social login)
  const signOut = async () => {
    try {
      await fetch("/auth/local/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setUser(null);
  };

  return {
    user,
    updateUser,
    loading: authCtx.loading,
    signOut,
  };
}
