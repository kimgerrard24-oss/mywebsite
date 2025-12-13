// ==============================
// frontend/context/AuthContext.tsx
// ==============================

import React, { createContext, useContext, useEffect, useState } from "react";
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
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
    // 1) ALWAYS check Local Auth first
    // ----------------------------------
    (async () => {
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
        setLoading(false);
      }
    })();

    // ----------------------------------
    // 2) Firebase = enhancement layer
    //    (Social login / WS support)
    // ----------------------------------
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // ถ้าไม่มี firebaseUser → ไม่กระทบ Local Auth
      if (!firebaseUser) return;

      try {
        const profile = await getProfile();
        if (profile) {
          setUser(profile);
        }
      } catch {
        // ไม่ overwrite Local Auth state
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
