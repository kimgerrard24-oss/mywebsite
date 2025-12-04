// stores/user.store.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type User = {
  id: string;
  email?: string | null;
  username?: string | null;
  // add other non-sensitive fields if needed
};

type UserContextValue = {
  user: User | null;
  setUser: (u: User | null) => void;
  isAuthenticated: boolean;
};

/**
 * Simple React Context store for user state.
 * - Stores only non-sensitive fields.
 * - Persists minimal state in localStorage for UX (optional).
 * - Do NOT store tokens or secrets here.
 */

const STORAGE_KEY = 'phl_user_v1';

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserRaw] = useState<User | null>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (!raw) return null;
      const parsed = JSON.parse(raw) as User;
      // Basic sanity check
      if (parsed && parsed.id) return parsed;
      return null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  }, [user]);

  const setUser = (u: User | null) => {
    setUserRaw(u);
  };

  const value: UserContextValue = {
    user,
    setUser,
    isAuthenticated: Boolean(user),
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/**
 * Hook for components to access user store.
 */
export function useUserStore() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUserStore must be used within UserProvider');
  }
  return ctx;
}
