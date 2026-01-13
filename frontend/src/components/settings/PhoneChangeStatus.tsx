// frontend/src/components/settings/PhoneChangeStatus.tsx

import Link from "next/link";

type Props = {
  isPhoneVerified: boolean;
};

export default function PhoneChangeStatus({
  isPhoneVerified,
}: Props) {
  if (isPhoneVerified) return null;

  return (
    <div className="rounded border p-4">
      <p className="text-sm">
        Your phone number is not verified.
      </p>

      <Link
        href="/settings/phone/confirm"
        prefetch={false}
        className="mt-2 inline-block text-sm text-blue-600 hover:underline"
      >
        Confirm phone number →
      </Link>
    </div>
  );
}
