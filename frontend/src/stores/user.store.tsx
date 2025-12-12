// stores/user.store.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api/api';

type User = {
  id: string;
  email?: string | null;
  username?: string | null;
};

type UserContextValue = {
  user: User | null;
  setUser: (u: User | null) => void;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
};

const STORAGE_KEY = 'phl_user_v1';

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserRaw] = useState<User | null>(() => {
    try {
      if (typeof window === 'undefined') return null;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as User;
      if (parsed && parsed.id) return parsed;

      return null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
  }, [user]);

  const setUser = (u: User | null) => {
    setUserRaw(u);
  };

  // logout
  const logout = async () => {
    try {
      await api.post('/auth/local/logout', {});
    } catch (err) {
      console.warn('logout API error', err);
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}

    setUserRaw(null);
  };

  const value: UserContextValue = {
    user,
    setUser,
    isAuthenticated: Boolean(user),
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserStore() {
  const ctx = useContext(UserContext);

  if (!ctx) {
    if (typeof window !== 'undefined') {
      console.warn('useUserStore called outside of UserProvider');
    }
    return {
      user: null,
      setUser: () => {},
      isAuthenticated: false,
      logout: async () => {},
    };
  }

  return ctx;
}
