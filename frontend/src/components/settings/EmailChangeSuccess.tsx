// frontend/src/components/settings/EmailChangeSuccess.tsx

type Props = {
  email: string;
};

export default function EmailChangeSuccess({
  email,
}: Props) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-medium">
        Check your email
      </h2>

      <p className="text-sm text-gray-600">
        We sent a confirmation link to:
      </p>

      <p className="text-sm font-medium break-all">
        {email}
      </p>

      <p className="text-sm text-gray-600">
        Open the link to confirm your new email
        address.
      </p>
    </div>
  );
}
