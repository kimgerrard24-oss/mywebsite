// frontend/src/components/profile/UsernameEditor.tsx

import { useEffect, useState } from "react";
import { useUpdateUsername } from "@/hooks/useUpdateUsername";

type Props = {
  currentUsername: string;
};

export default function UsernameEditor({
  currentUsername,
}: Props) {
  // baseline from backend
  const [committedUsername, setCommittedUsername] =
    useState(currentUsername);

  const [username, setUsername] = useState(currentUsername);
  const [success, setSuccess] = useState(false);

  const { submit, loading, error } = useUpdateUsername();

  // ✅ keep in sync if parent refetch profile
  useEffect(() => {
    setCommittedUsername(currentUsername);
    setUsername(currentUsername);
  }, [currentUsername]);

  const onSubmit = async () => {
    setSuccess(false);

    try {
      const next = username.trim();
      await submit(next);

      // ✅ reflect backend-confirmed state
      setCommittedUsername(next);
      setSuccess(true);
    } catch {
      // error handled in hook
    }
  };

  const unchanged = username === committedUsername;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        Username
      </label>

      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full rounded border px-3 py-2 text-sm"
        placeholder="your_username"
        minLength={3}
        maxLength={30}
        pattern="[a-zA-Z0-9_]+"
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {success && (
        <p
          className="text-sm text-green-600"
          role="status"
          aria-live="polite"
        >
          Username updated successfully
        </p>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={loading || unchanged}
        className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? "Updating..." : "Update username"}
      </button>
    </div>
  );
}
