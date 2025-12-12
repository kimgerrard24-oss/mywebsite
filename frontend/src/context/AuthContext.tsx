// ==============================
// frontend/context/AuthContext.tsx
// FIXED (เฉพาะส่วนที่จำเป็น)
// ==============================

import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { getFirebaseAuth } from "firebase/client";
import { onAuthStateChanged, type Auth } from "firebase/auth";
import { getProfile } from "@/lib/api/auth";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
}

const API_BASE =
  (process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "https://api.phlyphant.com").replace(/\/+$/, "");

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    let auth: Auth;

    try {
      auth = getFirebaseAuth();
    } catch (err) {
      setUser(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        // CASE 1 — Local Auth (ไม่มี firebaseUser)
        if (!firebaseUser) {
          try {
            // ***** FIX 1 — getProfile() ไม่มี .data *****
            const profile = await getProfile();
            if (profile) {
              setUser(profile);
              setLoading(false);
              return;
            }
          } catch {}

          // ***** FIX 2 — fallback เรียก users/me แบบถูกต้อง *****
          const res2 = await fetch(`${API_BASE}/users/me`, {
            method: "GET",
            credentials: "include",
            headers: { Accept: "application/json" }
          });

          if (res2.ok) {
            const u = await res2.json().catch(() => null);
            setUser(u || null);
          } else {
            setUser(null);
          }

          setLoading(false);
          return;
        }

        // CASE 2 — Firebase user exists (Social Login)
        const res = await fetch(`${API_BASE}/auth/session-check`, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" }
        });

        const data = await res.json().catch(() => null);
        const valid = data?.valid === true;

        if (valid) {
          const profile = await getProfile().catch(() => null);
          if (profile) {
            setUser(profile);
          } else {
            setUser(data.user || null);
          }
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      try {
        unsubscribe();
      } catch {}
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }
  return ctx;
}

export { AuthContext };
