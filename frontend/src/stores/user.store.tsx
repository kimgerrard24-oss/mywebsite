// stores/user.store.tsx

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api/api";
import { useAuthContext } from "@/context/AuthContext";

export type User = {
  id: string;
  email?: string | null;
  username?: string | null;
  avatar?: string | null;
};

type UserContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser, loading: authLoading } = useAuthContext();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync from AuthContext
  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (authUser) {
      const username =
        authUser.displayName?.trim() ||
        (authUser.email ? authUser.email.split("@")[0] : null);

      setUser({
        id: authUser.id,
        email: authUser.email,
        username,
        avatar: authUser.avatarUrl || null,
      });

      setLoading(false);
      return;
    }

    // auth resolved แต่ไม่มี user
    setUser(null);
    setLoading(false);
  }, [authUser, authLoading]);

  // Backend logout
  const logout = async () => {
    try {
      await api.post("/auth/local/logout", {});
    } catch (err) {
      console.warn("logout API error:", err);
    }

    setUser(null);
  };

  const value: UserContextValue = {
    user,
    // ❗ สำคัญ: auth decision ต้องอิง AuthContext + loading
    isAuthenticated: !loading && Boolean(authUser),
    loading,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserStore() {
  const ctx = useContext(UserContext);

  if (!ctx) {
    if (typeof window !== "undefined") {
      console.warn("useUserStore called outside of UserProvider");
    }
    return {
      user: null,
      isAuthenticated: false,
      loading: true,
      logout: async () => {},
    };
  }

  return ctx;
}
