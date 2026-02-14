// frontend/src/components/profile/ProfileUpdateComposer.tsx

"use client";

import { useState } from "react";
import { useProfileUpdateDraft } from "@/hooks/useProfileUpdateDraft";
import { useProfileUpdatePublish } from "@/hooks/useProfileUpdatePublish";
import { useProfileUpdateStore } from "@/stores/profile-update.store";
import ProfileUpdateVisibilitySelector from "./ProfileUpdateVisibilitySelector";
import ProfileUpdateActions from "./ProfileUpdateActions";

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
    useState<"PUBLIC" | "FOLLOWERS" | "PRIVATE" | "CUSTOM">(
      "PUBLIC",
    );

  const handleSaveDraft = async () => {
    const result = await createDraft({
      mediaId: draft!.mediaId,
      type: draft!.type,
      content,
      visibility,
    });

    if (result) setDraft(result);
  };

  const handlePublish = async () => {
    if (!draft) return;

    const res = await publish({ type: draft.type });

    if (res) {
      clear();
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

