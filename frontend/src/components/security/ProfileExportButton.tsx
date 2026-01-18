import { useRouter } from "next/router";

export default function ProfileExportButton() {
  const router = useRouter();

  function handleStartExportFlow() {
    /**
     * 🔐 Sensitive action
     * Must verify credential first, then return to FE
     * FE will trigger actual download
     */
    const next = "/settings/security?do=export";

    router.push(
      `/settings/verify?next=${encodeURIComponent(next)}`,
    );
  }

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
