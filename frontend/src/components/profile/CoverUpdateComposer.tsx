// frontend/src/components/profile/CoverUpdateComposer.tsx

"use client";

import { useState, useEffect } from "react";
import { useCoverUpdateDraft } from "@/hooks/useCoverUpdateDraft";
import { useCoverUpdatePublish } from "@/hooks/useCoverUpdatePublish";
import { useCoverUpdateStore } from "@/stores/cover-update.store";
import CoverUpdateVisibilitySelector from "./CoverUpdateVisibilitySelector";
import CoverUpdateActions from "./CoverUpdateActions";
import { CoverUploader } from "./CoverUploader";
import { useCurrentProfileMedia } from "@/hooks/useCurrentProfileMedia";
import type { PostVisibility } from "@/types/cover-update";
import { DeleteProfileMediaButton } from "@/components/profile/DeleteProfileMediaButton";

type Props = {
  onClose: () => void;
  currentMedia: ReturnType<typeof useCurrentProfileMedia>;
};

export default function CoverUpdateComposer({
  onClose,
  currentMedia,
}: Props) {

  const { draft, setDraft } = useCoverUpdateStore();
  const { createDraft } = useCoverUpdateDraft();
  const { publish, loading } = useCoverUpdatePublish();

  const [content, setContent] = useState("");
  const [visibility, setVisibility] =
    useState<PostVisibility>("PUBLIC");

    useEffect(() => {

  function handleEsc(e: KeyboardEvent) {

    if (e.key !== "Escape") return;

    const target = e.target as HTMLElement | null;

    if (!target) {
      onClose();
      return;
    }

    const tag = target.tagName;

    if (
      tag === "TEXTAREA" ||
      tag === "INPUT" ||
      target.isContentEditable
    ) {
      return;
    }

    onClose();
  }

  window.addEventListener("keydown", handleEsc);

  return () => {
    window.removeEventListener("keydown", handleEsc);
  };

}, [onClose]);



  /**
   * Sync draft → local state
   */
  useEffect(() => {

    if (!draft) return;

    setContent(draft.content ?? "");
    setVisibility(draft.visibility ?? "PUBLIC");

  }, [draft]);

  /**
   * Save Draft
   */
  async function handleSaveDraft() {

    if (!draft) return;

    const result = await createDraft({
      mediaId: draft.mediaId,
      content,
      visibility,
    });

    if (result) {
      setDraft(result);
    }
  }

  /**
   * Publish Draft
   */
  async function handlePublish() {

    if (!draft) return;

    const res = await publish();

    if (res) {

      setContent("");
      setVisibility("PUBLIC");

      onClose();
    }
  }

  return (
    <section
      aria-labelledby="cover-update-heading"
      className="
        w-full
        bg-white
        border
        rounded-xl
        p-4
        sm:p-5
        space-y-4
      "
    >

      {/* Heading */}
      <header className="flex items-center justify-between">

  <h2
    id="cover-update-heading"
    className="text-base font-semibold text-gray-900"
  >
    อัปเดตรูปปก
  </h2>

  <button
    type="button"
    onClick={onClose}
    aria-label="Close"
    className="
      inline-flex
      items-center
      justify-center
      w-8
      h-8
      rounded-full
      hover:bg-gray-100
      text-gray-500
      hover:text-gray-700
      transition
    "
  >
    ✕
  </button>

</header>


      {/* ================================
   COVER SECTION (PREVIEW + UPLOAD + DELETE)
   ================================ */}
<section className="border rounded-lg p-3 sm:p-4 bg-gray-50 space-y-3">

  {/* Cover Preview */}
  <div className="relative w-full h-32 sm:h-40 overflow-hidden rounded-lg border">

    {currentMedia.loading ? (

      <div className="w-full h-full bg-gray-200 animate-pulse" />

    ) : currentMedia.data?.cover?.url ? (

      <img
        src={currentMedia.data.cover.url}
        alt="Current cover"
        className="w-full h-full object-cover"
      />

    ) : (

      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
        No cover photo
      </div>

    )}

  </div>


  {/* Upload + Delete */}
  <div className="flex flex-col gap-2">

    <CoverUploader
      currentMedia={currentMedia}
    />

    {currentMedia.data?.cover?.mediaId && (

      <DeleteProfileMediaButton
        mediaId={currentMedia.data.cover.mediaId}
        onDeleted={() => {
          currentMedia.refetch();
        }}
      />

    )}

  </div>

</section>



      {/* Composer */}
      <div className="space-y-3">

        <label
          htmlFor="cover-update-content"
          className="sr-only"
        >
          คำอธิบายรูปปก
        </label>

        <textarea
          id="cover-update-content"
          className="
            w-full
            border
            rounded-lg
            p-3
            text-sm
            sm:text-base
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            resize-none
          "
          placeholder="Write something about your new cover..."
          value={content}
          onChange={(e) =>
            setContent(e.target.value)
          }
          rows={3}
        />

      </div>


      {/* Visibility */}
      <div className="flex items-center justify-between">

        <CoverUpdateVisibilitySelector
          value={visibility}
          onChange={setVisibility}
        />

      </div>


      {/* Actions */}
      <footer className="flex items-center justify-between">

  <button
    type="button"
    onClick={onClose}
    className="
      px-4
      py-2
      text-sm
      font-medium
      text-gray-700
      bg-gray-100
      hover:bg-gray-200
      rounded-md
      transition
    "
  >
    Cancel
  </button>

  <CoverUpdateActions
    onSave={handleSaveDraft}
    onPublish={handlePublish}
    loading={loading}
  />

</footer>


    </section>
  );
}

