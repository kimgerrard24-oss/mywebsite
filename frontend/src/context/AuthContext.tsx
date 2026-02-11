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
  coverUrl?: string | null;
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

  const fetchingRef = useRef(false);
  const socketReadyRef = useRef(false);

  /**
   * Backend session = authority
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
    } finally {
      fetchingRef.current = false;
    }
  };

  /**
   * Exposed helper
   */
  const refreshUser = async () => {
    const hasSession = await checkSession();
    if (!hasSession) {
      socketReadyRef.current = false;
      resetSocket();
      return;
    }

    await fetchProfileSafely();

    if (!socketReadyRef.current) {
      socketReadyRef.current = true;
      connectSocket();
    }
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

    /**
     * 1) Initial backend session check
     */
    (async () => {
      try {
        const hasSession = await checkSession();
        if (hasSession) {
          await fetchProfileSafely();

          if (!socketReadyRef.current) {
            socketReadyRef.current = true;
            connectSocket();
          }
        } else {
          socketReadyRef.current = false;
          resetSocket();
        }
      } finally {
        setLoading(false);
      }
    })();

    /**
     * 2) Firebase enhancement only
     */
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) return;

      await new Promise((r) => setTimeout(r, 300));

      const hasSession = await checkSession();
      if (!hasSession) {
        socketReadyRef.current = false;
        resetSocket();
        return;
      }

      await fetchProfileSafely();

      if (!socketReadyRef.current) {
        socketReadyRef.current = true;
        connectSocket();
      }
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

export function useAuth() {
  return useAuthContext();
}

export { AuthContext };
