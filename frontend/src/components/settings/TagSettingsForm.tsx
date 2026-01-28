// frontend/src/components/settings/TagSettingsForm.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import type {
  MyTagSettings,
  TagAllowScope,
} from "@/types/tag-settings";
import { useUpdateTagSettings } from "@/hooks/useUpdateTagSettings";

type Props = {
  initial: MyTagSettings;
};

export default function TagSettingsForm({ initial }: Props) {
  /**
   * =================================================
   * Local form state (editable)
   * =================================================
   */
  const [allowTagFrom, setAllowTagFrom] =
    useState<TagAllowScope>(initial.allowTagFrom);

  const [requireApproval, setRequireApproval] =
    useState<boolean>(initial.requireApproval);

  /**
   * =================================================
   * Last confirmed state (backend authority snapshot)
   * ใช้แทน initial หลัง save สำเร็จ
   * =================================================
   */
  const lastConfirmedRef = useRef<MyTagSettings>(initial);

  /**
   * =================================================
   * UI feedback
   * =================================================
   */
  const [success, setSuccess] = useState(false);

  const { submit, loading, error } = useUpdateTagSettings();

  /**
   * =================================================
   * Sync when parent provides new initial (SSR / refetch)
   * =================================================
   */
  useEffect(() => {
    lastConfirmedRef.current = initial;
    setAllowTagFrom(initial.allowTagFrom);
    setRequireApproval(initial.requireApproval);
  }, [initial.allowTagFrom, initial.requireApproval]);

  /**
   * =================================================
   * Dirty check vs last confirmed (not raw initial)
   * =================================================
   */
  const isDirty =
    allowTagFrom !==
      lastConfirmedRef.current.allowTagFrom ||
    requireApproval !==
      lastConfirmedRef.current.requireApproval;

  /**
   * =================================================
   * Save handler
   * =================================================
   */
  async function onSave() {
    if (loading || !isDirty) return;

    try {
      await submit({
        allowTagFrom,
        requireApproval,
      });

      // ✅ treat current value as backend-confirmed snapshot
      lastConfirmedRef.current = {
        allowTagFrom,
        requireApproval,
      };

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      // error handled by hook
    }
  }

  return (
    <section className="rounded-xl border p-5 bg-white">
      <h2 className="text-lg font-semibold">
        Tag settings
      </h2>

      <p className="mt-1 text-sm text-gray-600">
        Control who can tag you in posts.
      </p>

      {/* ================= Allow From ================= */}
      <div className="mt-5">
        <label
          htmlFor="allowTagFrom"
          className="block text-sm font-medium"
        >
          Who can tag you
        </label>

        <select
          id="allowTagFrom"
          value={allowTagFrom}
          disabled={loading}
          onChange={(e) =>
            setAllowTagFrom(
              e.target.value as TagAllowScope,
            )
          }
          className="
            mt-2
            w-full
            rounded-md
            border
            px-3
            py-2
            text-sm
            disabled:bg-gray-100
            disabled:cursor-not-allowed
          "
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
          disabled={loading}
          onChange={(e) =>
            setRequireApproval(e.target.checked)
          }
          className="h-4 w-4 disabled:cursor-not-allowed"
        />

        <label
          htmlFor="requireApproval"
          className="text-sm select-none"
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
          Settings updated successfully
        </p>
      )}

      {/* ================= Actions ================= */}
      <div className="mt-5 flex items-center gap-3">
        <button
          disabled={loading || !isDirty}
          onClick={onSave}
          className="
            rounded
            bg-blue-600
            px-4
            py-2
            text-sm
            text-white
            hover:bg-blue-700
            disabled:opacity-60
            disabled:cursor-not-allowed
          "
        >
          {loading ? "Saving..." : "Save changes"}
        </button>

        {!isDirty && !loading && (
          <span className="text-xs text-gray-500">
            All changes saved
          </span>
        )}
      </div>
    </section>
  );
}
