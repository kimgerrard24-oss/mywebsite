// frontend/src/components/settings/EmailVerificationStatus.tsx

type Props = {
  isVerified: boolean;
};

export default function EmailVerificationStatus({ isVerified }: Props) {
  if (isVerified) {
    return (
      <span className="ml-2 inline-flex items-center gap-1 text-xs text-green-600">
        ✓ Verified
      </span>
    );
  }

  return (
    <span className="ml-2 inline-flex items-center gap-1 text-xs text-amber-600">
        ⚠ Not verified
    </span>
  );
}
