// frontend/src/components/profile/ProfileUpdateModal.tsx

"use client";

import ProfileUpdateComposer from "./ProfileUpdateComposer";
import { useProfileUpdateStore } from "@/stores/profile-update.store";

export default function ProfileUpdateModal() {
  const { draft, clear } = useProfileUpdateStore();

  if (!draft) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg p-6">
        <ProfileUpdateComposer onClose={clear} />
      </div>
    </div>
  );
}



