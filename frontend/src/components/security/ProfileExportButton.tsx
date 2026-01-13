// frontend/src/components/security/ProfileExportButton.tsx

import { useState } from "react";
import { exportMyProfile } from "@/lib/api/user-export";
import { downloadBlob } from "@/utils/download";

export default function ProfileExportButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setError(null);
    setLoading(true);

    try {
      const blob = await exportMyProfile();

      const filename = `phlyphant-profile-export-${new Date()
        .toISOString()
        .slice(0, 19)}.json`;

      downloadBlob(blob, filename);
    } catch (err: any) {
      setError(
        "Failed to export profile. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={loading}
        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
      >
        {loading ? "Preparing export..." : "Download my data"}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
