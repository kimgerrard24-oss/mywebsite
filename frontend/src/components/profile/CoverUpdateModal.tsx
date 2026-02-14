// frontend/src/components/profile/CoverUpdateModal.tsx

"use client";

import CoverUpdateComposer from "./CoverUpdateComposer";
import { useCoverUpdateStore } from "@/stores/cover-update.store";

export default function CoverUpdateModal() {
  const { draft, clear } = useCoverUpdateStore();

  if (!draft) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg p-6">
        <CoverUpdateComposer onClose={clear} />
      </div>
    </div>
  );
}
