// frontend/src/components/security/AccountLockForm.tsx

import { useRouter } from "next/router";

export default function AccountLockForm() {
  const router = useRouter();

  function handleStartLockFlow() {
    router.push(
      "/settings/verify?next=/settings/security?do=lock",
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-red-700">
        You will be asked to confirm your password
        before locking your account.
      </p>

      <button
        onClick={handleStartLockFlow}
        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        Continue to verification
      </button>
    </div>
  );
}
