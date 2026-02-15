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

type Props = {
  onClose: () => void;
  currentMedia: ReturnType<typeof useCurrentProfileMedia>;
};

export default function ProfileUpdateComposer({
  onClose,
  currentMedia,
}: Props) {

  const { draft, setDraft, clear } = useProfileUpdateStore();
  const { createDraft } = useProfileUpdateDraft();
  const { publish, loading } = useProfileUpdatePublish();

  const [content, setContent] = useState("");
  const [visibility, setVisibility] =
    useState<PostVisibility>("PUBLIC");

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

      clear();

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
      <header>
        <h2
          id="profile-update-heading"
          className="text-base font-semibold text-gray-900"
        >
          อัปเดตโปรไฟล์
        </h2>
      </header>


      {/* Avatar uploader */}
      <div className="border rounded-lg p-3 sm:p-4 bg-gray-50">

        <AvatarUploader
          currentMedia={currentMedia}
        />

      </div>


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
      <footer>

        <ProfileUpdateActions
          onSave={handleSaveDraft}
          onPublish={handlePublish}
          loading={loading}
        />

      </footer>

    </section>
  );
}
