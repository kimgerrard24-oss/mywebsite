// ==============================
// frontend/context/AuthContext.tsx
// ==============================

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';

import { getFirebaseAuth } from '@/lib/firebaseClient';
import { onAuthStateChanged, type Auth } from 'firebase/auth';

const API_BASE =
  (process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "https://api.phlyphant.com").replace(/\/+$/, "");

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    let auth: Auth;

    try {
      auth = getFirebaseAuth() as Auth;
    } catch (err) {
      console.error("Firebase init error in AuthContext:", err);
      setUser(null);
      setLoading(false);
      return;
    }

    // FIX — sync Firebase client auth with backend session-check
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      try {
        const res = await fetch(`${API_BASE}/auth/session-check`, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        const data = await res.json().catch(() => ({}));
        const valid = data?.valid === true;

        if (valid) {
          setUser(u);
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
    throw new Error('useAuthContext must be used inside AuthProvider');
  }
  return ctx;
}
