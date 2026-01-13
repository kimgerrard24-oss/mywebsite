// frontend/src/components/profile/ProfileForm.tsx
import { useState } from "react";
import type { UserProfile, UpdateUserPayload } from "@/types/user-profile";
import { updateUserProfile } from "@/lib/api/user";
import UsernameEditor from "./UsernameEditor";
import EmailChangeForm from "./EmailChangeForm";

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
  <form
    onSubmit={onSubmit}
    className="
      w-full
      max-w-2xl
      space-y-4
      sm:space-y-6
    "
    aria-label="Edit profile form"
  >
    {/* ===== Display name ===== */}
    <div>
      <label
        htmlFor="display-name"
        className="
          block
          text-xs
          sm:text-sm
          font-medium
          text-gray-700
        "
      >
        Display name
      </label>
      <input
        id="display-name"
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        maxLength={50}
        className="
          mt-1
          w-full
          rounded-md
          sm:rounded-lg
          border
          border-gray-300
          px-3
          sm:px-4
          py-2
          text-sm
          sm:text-base
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
        "
      />
    </div>
    {/* ================================
    Username Section
   ================================ */}
<section className="mt-8 space-y-2">
  <h2 className="text-lg font-medium">Username</h2>
  <UsernameEditor currentUsername={user.username} />
</section>

<section className="mt-8 space-y-2">
  <h2 className="text-lg font-medium">Email</h2>
  <EmailChangeForm />
</section>

    {/* ===== Bio ===== */}
    <div>
      <label
        htmlFor="bio"
        className="
          block
          text-xs
          sm:text-sm
          font-medium
          text-gray-700
        "
      >
        Bio
      </label>
      <textarea
        id="bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        maxLength={160}
        rows={4}
        className="
          mt-1
          w-full
          rounded-md
          sm:rounded-lg
          border
          border-gray-300
          px-3
          sm:px-4
          py-2
          text-sm
          sm:text-base
          leading-relaxed
          resize-y
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
        "
      />
    </div>

    {/* ===== Feedback ===== */}
    {error && (
      <p
        className="
          text-xs
          sm:text-sm
          text-red-600
        "
        role="alert"
      >
        {error}
      </p>
    )}
    {success && (
      <p
        className="
          text-xs
          sm:text-sm
          text-green-600
        "
        role="status"
        aria-live="polite"
      >
        Profile updated
      </p>
    )}

    {/* ===== Action ===== */}
    <div className="pt-1 sm:pt-2">
      <button
        type="submit"
        disabled={loading}
        className="
          inline-flex
          items-center
          justify-center
          rounded-md
          sm:rounded-lg
          bg-black
          px-4
          sm:px-5
          py-2
          sm:py-2.5
          text-sm
          sm:text-base
          font-medium
          text-white
          hover:bg-gray-800
          disabled:opacity-50
          disabled:cursor-not-allowed
          transition
        "
      >
        {loading ? "Saving..." : "Save changes"}
      </button>
    </div>
  </form>
);

}
