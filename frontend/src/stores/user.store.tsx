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
  cover?: string | null;
};

type UserContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  updateAvatar: (avatarUrl: string) => void;
  updateCover: (coverUrl: string) => void;
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
  cover: authUser.coverUrl || null,
});


      setLoading(false);
      return;
    }

    // auth resolved แต่ไม่มี user
    setUser(null);
    setLoading(false);
  }, [authUser, authLoading]);

   const updateAvatar = (avatarUrl: string) => {
    setUser((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        avatar: avatarUrl,
      };
    });
  };

  const updateCover = (coverUrl: string) => {
  setUser((prev) => {
    if (!prev) return prev;

    return {
      ...prev,
      cover: coverUrl,
    };
  });
};

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
    updateAvatar,
    updateCover,
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
      updateAvatar: () => {},
      updateCover: () => {},
    };
  }

  return ctx;
}
