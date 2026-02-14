// frontend/src/components/profile/CoverUpdateModal.tsx

"use client";

import CoverUpdateComposer from "./CoverUpdateComposer";
import { useProfileUpdateStore } from "@/stores/profile-update.store";

export default function CoverUpdateModal() {
  const { draft, clear } = useProfileUpdateStore();

  // เปิด modal เมื่อมี draft และเป็น COVER
  if (!draft || draft.type !== "COVER") return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-lg">
        <CoverUpdateComposer onClose={clear} />
      </div>
    </div>
  );
}

