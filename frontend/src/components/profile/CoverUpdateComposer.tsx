// frontend/src/components/profile/CoverUpdateComposer.tsx

"use client";

import { useState, useEffect } from "react";
import { useCoverUpdateDraft } from "@/hooks/useCoverUpdateDraft";
import { useCoverUpdatePublish } from "@/hooks/useCoverUpdatePublish";
import { useCoverUpdateStore } from "@/stores/cover-update.store";
import CoverUpdateVisibilitySelector from "./CoverUpdateVisibilitySelector";
import CoverUpdateActions from "./CoverUpdateActions";
import type { PostVisibility } from "@/types/cover-update";

export default function CoverUpdateComposer({
  onClose,
}: {
  onClose: () => void;
}) {
  const { draft, setDraft, clear } = useCoverUpdateStore();
  const { createDraft } = useCoverUpdateDraft();
  const { publish, loading } = useCoverUpdatePublish();

  const [content, setContent] = useState("");
  const [visibility, setVisibility] =
    useState<PostVisibility>("PUBLIC");

  /**
   * ✅ Sync draft → local state
   * Production-grade behavior:
   * - Restore existing draft content
   * - Restore existing draft visibility
   */
  useEffect(() => {
    if (!draft) return;

    setContent(draft.content ?? "");
    setVisibility(draft.visibility ?? "PUBLIC");
  }, [draft]);

  /**
   * Save Draft
   */
  const handleSaveDraft = async () => {
    if (!draft) return;

    const result = await createDraft({
      mediaId: draft.mediaId,
      content,
      visibility,
    });

    if (result) {
      setDraft(result);
    }
  };

  /**
   * Publish Draft
   */
  const handlePublish = async () => {
    if (!draft) return;

    const res = await publish();

    if (res) {
      clear();
      setContent("");
      setVisibility("PUBLIC");
      onClose();
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        className="w-full border rounded-lg p-2"
        placeholder="Write something about your new cover..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <CoverUpdateVisibilitySelector
        value={visibility}
        onChange={setVisibility}
      />

      <CoverUpdateActions
        onSave={handleSaveDraft}
        onPublish={handlePublish}
        loading={loading}
      />
    </div>
  );
}
