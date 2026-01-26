// frontend/src/components/settings/TagSettingsForm.tsx

"use client";

import { useState, useEffect } from "react";
import type {
  MyTagSettings,
  TagAllowScope,
} from "@/types/tag-settings";
import { useUpdateTagSettings } from "@/hooks/useUpdateTagSettings";

type Props = {
  initial: MyTagSettings;
};

export default function TagSettingsForm({ initial }: Props) {
  const [allowTagFrom, setAllowTagFrom] =
    useState<TagAllowScope>(initial.allowTagFrom);

  const [requireApproval, setRequireApproval] =
    useState<boolean>(initial.requireApproval);

  const [success, setSuccess] = useState(false);

  const { submit, loading, error } = useUpdateTagSettings();

  // =============================
  // Sync with parent / backend
  // =============================
  useEffect(() => {
    setAllowTagFrom(initial.allowTagFrom);
    setRequireApproval(initial.requireApproval);
  }, [initial.allowTagFrom, initial.requireApproval]);

  const isDirty =
    allowTagFrom !== initial.allowTagFrom ||
    requireApproval !== initial.requireApproval;

  async function onSave() {
    try {
      await submit({
        allowTagFrom,
        requireApproval,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      // handled by hook
    }
  }

  return (
    <section className="rounded-xl border p-5">
      <h2 className="text-lg font-semibold">
        Tag settings
      </h2>

      <p className="mt-1 text-sm text-gray-600">
        Control who can tag you in posts.
      </p>

      {/* ================= Allow From ================= */}
      <div className="mt-5">
        <label className="block text-sm font-medium">
          Who can tag you
        </label>

        <select
          value={allowTagFrom}
          onChange={(e) =>
            setAllowTagFrom(
              e.target.value as TagAllowScope,
            )
          }
          className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
        >
          <option value="ANYONE">Anyone</option>
          <option value="FOLLOWERS">Followers only</option>
          <option value="NO_ONE">No one</option>
        </select>
      </div>

      {/* ================= Require Approval ================= */}
      <div className="mt-4 flex items-center gap-3">
        <input
          id="requireApproval"
          type="checkbox"
          checked={requireApproval}
          onChange={(e) =>
            setRequireApproval(e.target.checked)
          }
          className="h-4 w-4"
        />

        <label
          htmlFor="requireApproval"
          className="text-sm"
        >
          Require approval before tag appears
        </label>
      </div>

      {/* ================= Feedback ================= */}
      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {success && (
        <p className="mt-3 text-sm text-green-600">
          Settings updated
        </p>
      )}

      {/* ================= Actions ================= */}
      <button
        disabled={loading || !isDirty}
        onClick={onSave}
        className="mt-5 rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save changes"}
      </button>
    </section>
  );
}

