// ==============================
// frontend/context/AuthContext.tsx
// ==============================

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Auth } from "firebase/auth";
import { getFirebaseAuth } from "firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { getProfile } from "@/lib/api/auth";
import { api } from "@/lib/api/api";
import { connectSocket, resetSocket } from "@/lib/socket";

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

  /**
   * Check backend session authority FIRST
   */
  const checkSession = async (): Promise<boolean> => {
    try {
      const res = await api.get("/auth/session-check");
      return Boolean(res?.data?.valid);
    } catch {
      return false;
    }
  };

  const fetchProfileSafely = async () => {
    if (fetchingRef.current) return;

    fetchingRef.current = true;
    try {
      const profile = await getProfile();
      if (profile) {
        setUser(profile);
      }
    } catch {
      // IMPORTANT:
      // Do NOT set user = null here
      // Resource failure !== session invalid
    } finally {
      fetchingRef.current = false;
    }
  };

  // ----------------------------------
  // Exposed helper for post-login sync
  // ----------------------------------
  const refreshUser = async () => {
    const hasSession = await checkSession();
    if (!hasSession) {
      resetSocket();
      return;
    }

    await fetchProfileSafely();
    connectSocket();
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
    // 1) Backend session = source of truth
    // ----------------------------------
    (async () => {
      try {
        const hasSession = await checkSession();
        if (hasSession) {
          await fetchProfileSafely();
          connectSocket();
        } else {
          resetSocket();
        }
      } finally {
        setLoading(false);
      }
    })();

    // ----------------------------------
    // 2) Firebase = enhancement layer ONLY
    // ----------------------------------
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) return;

      // Allow time for backend cookies/session
      await new Promise((r) => setTimeout(r, 300));

      const hasSession = await checkSession();
      if (!hasSession) {
        resetSocket();
        return;
      }

      await fetchProfileSafely();
      connectSocket();
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

/**
 * EXISTING hook (DO NOT TOUCH)
 */
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }
  return ctx;
}

/**
 * ================================
 * NEW: Alias hook (ADDITIVE ONLY)
 * ================================
 */
export function useAuth() {
  return useAuthContext();
}

export { AuthContext };
