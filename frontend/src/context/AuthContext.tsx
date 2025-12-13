// ==============================
// frontend/context/AuthContext.tsx
// ==============================

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import type { Auth } from "firebase/auth";
import { getFirebaseAuth } from "firebase/client";
import { onAuthStateChanged } from "firebase/auth";
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
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Prevent concurrent profile fetch
  const fetchingRef = useRef(false);

  const fetchProfileSafely = async () => {
    if (fetchingRef.current) return;

    fetchingRef.current = true;
    try {
      const profile = await getProfile();
      if (profile) {
        setUser(profile);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      fetchingRef.current = false;
    }
  };

  // ----------------------------------
  // Exposed helper for post-login sync
  // ----------------------------------
  const refreshUser = async () => {
    await fetchProfileSafely();
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    let auth: Auth | null = null;

    try {
      auth = getFirebaseAuth();
    } catch {
      auth = null;
    }

    // ----------------------------------
    // 1) Local Auth (primary source)
    // ----------------------------------
    (async () => {
      try {
        await fetchProfileSafely();
      } finally {
        setLoading(false);
      }
    })();

    // ----------------------------------
    // 2) Firebase = enhancement layer
    // ----------------------------------
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) return;

      await fetchProfileSafely();
    });

    return () => {
      try {
        unsubscribe();
      } catch {}
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
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
