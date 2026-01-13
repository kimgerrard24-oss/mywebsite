// frontend/src/components/profile/UsernameEditor.tsx

import { useState } from "react";
import { useUpdateUsername } from "@/hooks/useUpdateUsername";

type Props = {
  currentUsername: string;
};

export default function UsernameEditor({
  currentUsername,
}: Props) {
  const [username, setUsername] = useState(currentUsername);
  const [success, setSuccess] = useState(false);

  const { submit, loading, error } = useUpdateUsername();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    try {
      await submit(username.trim());
      setSuccess(true);
    } catch {
      // error handled in hook
    }
  };

  const unchanged = username === currentUsername;

  return (
    <form onSubmit={onSubmit} className="space-y-2">
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
        <p className="text-sm text-green-600">
          Username updated successfully
        </p>
      )}

      <button
        type="submit"
        disabled={loading || unchanged}
        className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? "Updating..." : "Update username"}
      </button>
    </form>
  );
}
