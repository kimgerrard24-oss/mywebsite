// frontend/src/stores/profile-update.store.tsx

"use client";

import { createContext, useContext, useState } from "react";
import type { ProfileUpdateDraft } from "@/types/profile-update";

type Store = {
  draft: ProfileUpdateDraft | null;
  setDraft: (d: ProfileUpdateDraft | null) => void;
  clear: () => void;
};

const Context = createContext<Store | undefined>(undefined);

export function ProfileUpdateStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [draft, setDraft] =
    useState<ProfileUpdateDraft | null>(null);

  return (
    <Context.Provider
      value={{
        draft,
        setDraft,
        clear: () => setDraft(null),
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useProfileUpdateStore() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("Missing ProfileUpdateStoreProvider");
  return ctx;
}
