"use client";

import { useState, useEffect } from "react";
import { useProfileUpdateDraft } from "@/hooks/useProfileUpdateDraft";
import { useProfileUpdatePublish } from "@/hooks/useProfileUpdatePublish";
import { useProfileUpdateStore } from "@/stores/profile-update.store";
import ProfileUpdateVisibilitySelector from "./ProfileUpdateVisibilitySelector";
import ProfileUpdateActions from "./ProfileUpdateActions";
import { AvatarUploader } from "./AvatarUploader";
import { useCurrentProfileMedia } from "@/hooks/useCurrentProfileMedia";
import type { PostVisibility } from "@/types/profile-update";
import { DeleteProfileMediaButton } from "@/components/profile/DeleteProfileMediaButton";

type Props = {
  onClose: () => void;
  currentMedia: ReturnType<typeof useCurrentProfileMedia>;
};

export default function ProfileUpdateComposer({
  onClose,
  currentMedia,
}: Props) {

  const { draft, setDraft } = useProfileUpdateStore();
  const { createDraft } = useProfileUpdateDraft();
  const { publish, loading } = useProfileUpdatePublish();

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
      aria-labelledby="profile-update-heading"
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
    id="profile-update-heading"
    className="text-base font-semibold text-gray-900"
  >
    อัปเดตโปรไฟล์
  </h2>

  {/* Close button */}
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
   AVATAR SECTION (PREVIEW + UPLOAD + DELETE)
   ================================ */}
<section className="border rounded-lg p-3 sm:p-4 bg-gray-50">

  <div className="flex items-start gap-4">

    {/* Avatar Preview */}
    <div className="relative h-20 w-20 shrink-0">

      {currentMedia.loading ? (

        <div className="h-20 w-20 rounded-full bg-gray-200 animate-pulse" />

      ) : currentMedia.data?.avatar?.url ? (

        <div className="h-20 w-20 rounded-full overflow-hidden border">

          <img
            src={currentMedia.data.avatar.url}
            alt="Current avatar"
            className="h-full w-full object-cover"
          />

        </div>

      ) : (

        <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-lg font-semibold border">
          U
        </div>

      )}

    </div>


    {/* Upload + Delete */}
    <div className="flex flex-col gap-2">

      <AvatarUploader
        currentMedia={currentMedia}
      />

      {currentMedia.data?.avatar?.mediaId && (

        <DeleteProfileMediaButton
          mediaId={currentMedia.data.avatar.mediaId}
          onDeleted={() => {
            currentMedia.refetch();
          }}
        />

      )}

    </div>

  </div>

</section>



      {/* Composer */}
      <div className="space-y-3">

        <label
          htmlFor="profile-update-content"
          className="sr-only"
        >
          เนื้อหาโพสต์
        </label>

        <textarea
          id="profile-update-content"
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
          placeholder="Write something..."
          value={content}
          onChange={(e) =>
            setContent(e.target.value)
          }
          rows={3}
        />

      </div>


      {/* Visibility */}
      <div className="flex items-center justify-between">

        <ProfileUpdateVisibilitySelector
          value={visibility}
          onChange={setVisibility}
        />

      </div>


      {/* Actions */}
      <footer className="flex items-center justify-between">

  {/* Cancel button */}
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


  <ProfileUpdateActions
    onSave={handleSaveDraft}
    onPublish={handlePublish}
    loading={loading}
  />

</footer>


    </section>
  );
}
