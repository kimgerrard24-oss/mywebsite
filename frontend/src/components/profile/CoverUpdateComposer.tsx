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

type Props = {
  onClose: () => void;
  currentMedia: ReturnType<typeof useCurrentProfileMedia>;
};

export default function CoverUpdateComposer({
  onClose,
  currentMedia,
}: Props) {

  const { draft, setDraft, clear } = useCoverUpdateStore();
  const { createDraft } = useCoverUpdateDraft();
  const { publish, loading } = useCoverUpdatePublish();

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
      <header>
        <h2
          id="cover-update-heading"
          className="text-base font-semibold text-gray-900"
        >
          อัปเดตรูปปก
        </h2>
      </header>


      {/* Cover uploader */}
      <div className="border rounded-lg p-3 sm:p-4 bg-gray-50">

        <CoverUploader
          currentMedia={currentMedia}
        />

      </div>


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
      <footer>

        <CoverUpdateActions
          onSave={handleSaveDraft}
          onPublish={handlePublish}
          loading={loading}
        />

      </footer>

    </section>
  );
}

