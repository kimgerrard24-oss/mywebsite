// frontend/src/stores/cover-update.store.tsx

"use client";

import { createContext, useContext, useState } from "react";
import type { CoverUpdateDraft } from "@/types/cover-update";

type Store = {
  draft: CoverUpdateDraft | null;
  setDraft: (d: CoverUpdateDraft | null) => void;
  clear: () => void;
};

const Context = createContext<Store | undefined>(undefined);

export function CoverUpdateStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [draft, setDraft] =
    useState<CoverUpdateDraft | null>(null);

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

export function useCoverUpdateStore() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("Missing CoverUpdateStoreProvider");
  return ctx;
}
