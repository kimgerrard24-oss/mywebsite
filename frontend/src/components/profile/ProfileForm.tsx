// frontend/src/components/profile/ProfileForm.tsx
import { useState } from "react";
import type { UserProfile, UpdateUserPayload } from "@/types/user-profile";
import { updateUserProfile } from "@/lib/api/user";

type Props = {
  user: UserProfile | null;
};

export default function ProfileForm({ user }: Props) {
  if (!user) {
    return null;
  }

  const currentUser = user;

  const [displayName, setDisplayName] = useState(
    currentUser.displayName ?? ""
  );
  const [bio, setBio] = useState(currentUser.bio ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const payload: UpdateUserPayload = {};

    if (displayName !== currentUser.displayName) {
      payload.displayName = displayName;
    }

    if (bio !== currentUser.bio) {
      payload.bio = bio;
    }

    if (Object.keys(payload).length === 0) {
      setError("Nothing to update");
      return;
    }

    try {
      setLoading(true);
      await updateUserProfile(payload);
      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium">
          Display name
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={50}
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={160}
          rows={4}
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-600">
          Profile updated
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
