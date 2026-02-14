// frontend/src/components/profile/CoverUpdateComposer.tsx

"use client";

import { useState } from "react";
import { useCoverUpdateDraft } from "@/hooks/useCoverUpdateDraft";
import { useCoverUpdatePublish } from "@/hooks/useCoverUpdatePublish";
import { useCoverUpdateStore } from "@/stores/cover-update.store";
import CoverUpdateVisibilitySelector from "./CoverUpdateVisibilitySelector";
import CoverUpdateActions from "./CoverUpdateActions";

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
    useState<"PUBLIC" | "FOLLOWERS" | "PRIVATE" | "CUSTOM">(
      "PUBLIC",
    );

  const handleSaveDraft = async () => {
    if (!draft) return;

    const result = await createDraft({
      mediaId: draft.mediaId,
      content,
      visibility,
    });

    if (result) setDraft(result);
  };

  const handlePublish = async () => {
    const postId = await publish();

    if (postId) {
      clear();
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
