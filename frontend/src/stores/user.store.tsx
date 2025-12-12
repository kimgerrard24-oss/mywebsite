// ==============================
// stores/user.store.tsx
// FIXED — Works with Hybrid Auth (Local + OAuth + Firebase)
// Frontend stays stateless. No localStorage.
// ==============================

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api/api";
import { useAuthContext } from "@/context/AuthContext";

// User type used for UI only
export type User = {
  id: string;
  email?: string | null;
  username?: string | null;
  avatar?: string | null;
};

// Store shape
type UserContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser, loading } = useAuthContext();

  // UI-friendly user object
  const [user, setUser] = useState<User | null>(null);

  // Sync with AuthContext user
  useEffect(() => {
    if (loading) return;

    if (authUser) {
      setUser({
        id: authUser.id,
        email: authUser.email,
        username: authUser.email ? authUser.email.split("@")[0] : null,
        avatar: authUser.avatarUrl || "/images/default-avatar.png"
      });
    } else {
      setUser(null);
    }
  }, [authUser, loading]);

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
    isAuthenticated: Boolean(user),
    logout
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Safe hook
export function useUserStore() {
  const ctx = useContext(UserContext);

  if (!ctx) {
    if (typeof window !== "undefined") {
      console.warn("useUserStore called outside of UserProvider");
    }
    return {
      user: null,
      isAuthenticated: false,
      logout: async () => {}
    };
  }

  return ctx;
}
