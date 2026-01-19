// frontend/src/components/security/ProfileExportButton.tsx

import { useRouter } from "next/router";
import { useCallback } from "react";

export default function ProfileExportButton() {
  const router = useRouter();

  const handleStartExportFlow = useCallback(() => {
    /**
     * 🔐 Sensitive action flow (legacy-compatible)
     * 1) verify credential
     * 2) redirect back to /settings/security?do=export
     * 3) that page triggers actual download
     *
     * NOTE:
     * - must be FE route only (anti open-redirect)
     * - backend remains authority
     */
    const next = "/settings/security?do=export";

    const target = `/settings/verify?next=${encodeURIComponent(
      next,
    )}`;

    router.push(target);
  }, [router]);

  return (
    <div>
      <button
        type="button"
        onClick={handleStartExportFlow}
        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
      >
        Download my data
      </button>
    </div>
  );
}

