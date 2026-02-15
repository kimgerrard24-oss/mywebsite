// frontend/src/components/profile/CoverUpdateModal.tsx

"use client";

import CoverUpdateComposer from "./CoverUpdateComposer";
import { useCoverUpdateStore } from "@/stores/cover-update.store";
import { useCurrentProfileMedia } from "@/hooks/useCurrentProfileMedia";

type Props = {
  currentMedia: ReturnType<typeof useCurrentProfileMedia>;
};

export default function CoverUpdateModal({
  currentMedia,
}: Props) {

  const { draft, clear } = useCoverUpdateStore();

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

        <CoverUpdateComposer
          currentMedia={currentMedia}
          onClose={clear}
        />

      </div>
    </div>
  );
}

