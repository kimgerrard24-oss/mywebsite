// frontend/src/components/profile/ProfileUpdateComposer.tsx

"use client";

import { useState, useEffect } from "react";
import { useProfileUpdateDraft } from "@/hooks/useProfileUpdateDraft";
import { useProfileUpdatePublish } from "@/hooks/useProfileUpdatePublish";
import { useProfileUpdateStore } from "@/stores/profile-update.store";
import ProfileUpdateVisibilitySelector from "./ProfileUpdateVisibilitySelector";
import ProfileUpdateActions from "./ProfileUpdateActions";
import type { PostVisibility } from "@/types/profile-update";

export default function ProfileUpdateComposer({
  onClose,
}: {
  onClose: () => void;
}) {
  const { draft, setDraft, clear } = useProfileUpdateStore();
  const { createDraft } = useProfileUpdateDraft();
  const { publish, loading } = useProfileUpdatePublish();

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
        placeholder="Write something..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <ProfileUpdateVisibilitySelector
        value={visibility}
        onChange={setVisibility}
      />

      <ProfileUpdateActions
        onSave={handleSaveDraft}
        onPublish={handlePublish}
        loading={loading}
      />
    </div>
  );
}



