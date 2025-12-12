// ==============================
// frontend/context/AuthContext.tsx
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
      console.error("Firebase init error in AuthContext:", err);
      setUser(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        // ======================================================
        // CASE 1: NO Firebase user → Local Auth mode
        // ======================================================
        if (!firebaseUser) {
          try {
            const profile = await getProfile();
            const extracted = profile?.data || null;

            if (extracted) {
              setUser(extracted);
              setLoading(false);
              return;
            }
          } catch {
            // fallback to session-check
          }

          const res = await fetch(`${API_BASE}/auth/session-check`, {
            method: "GET",
            credentials: "include",
            headers: { Accept: "application/json" },
          });

          const data = await res.json().catch(() => null);
          const valid = data?.valid === true;

          setUser(valid ? data.user || null : null);
          setLoading(false);
          return;
        }

        // ======================================================
        // CASE 2: Firebase user exists → Social Login mode
        // ======================================================
        const res = await fetch(`${API_BASE}/auth/session-check`, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        const data = await res.json().catch(() => null);
        const valid = data?.valid === true;

        if (valid) {
          setUser(data.user || null);

          const profile = await getProfile().catch(() => null);
          const extracted = profile?.data || null;

          if (extracted) {
            setUser(extracted);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("AuthContext: session-check failed:", err);
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
