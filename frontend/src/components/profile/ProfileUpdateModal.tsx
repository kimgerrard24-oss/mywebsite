// frontend/src/components/profile/ProfileUpdateModal.tsx

"use client";

import ProfileUpdateComposer from "./ProfileUpdateComposer";
import { useProfileUpdateStore } from "@/stores/profile-update.store";
import { useCurrentProfileMedia } from "@/hooks/useCurrentProfileMedia";

type Props = {
  currentMedia: ReturnType<typeof useCurrentProfileMedia>;
};

export default function ProfileUpdateModal({
  currentMedia,
}: Props) {

  const { draft, clear } = useProfileUpdateStore();

  if (!draft) return null;

  return (
    <div
      className="
        fixed
        inset-0
        bg-black/40
        flex
        justify-center
        items-center
        z-50
        px-4
      "
      role="dialog"
      aria-modal="true"
    >
      <div
        className="
          bg-white
          rounded-xl
          w-full
          max-w-lg
          p-5
          sm:p-6
          shadow-xl
        "
      >

        <ProfileUpdateComposer
          currentMedia={currentMedia}
          onClose={clear}
        />

      </div>
    </div>
  );
}




