// frontend/src/components/security/ProfileExportButton.tsx

import { useRouter } from "next/router";

export default function ProfileExportButton() {
  const router = useRouter();

  function handleStartExportFlow() {
    /**
     * 🔐 Sensitive action → must verify credential first
     * After verify, redirect to backend export endpoint
     */
    const next = "/users/me/profile/export";

    router.push(
      `/settings/verify?next=${encodeURIComponent(next)}`,
    );
  }

  return (
    <div>
      <button
        onClick={handleStartExportFlow}
        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
      >
        Download my data
      </button>
    </div>
  );
}
