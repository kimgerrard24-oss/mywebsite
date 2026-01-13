// frontend/src/components/users/UsernameAvailabilityHint.tsx

type Props = {
  status:
    | 'idle'
    | 'checking'
    | 'available'
    | 'unavailable'
    | 'error';
  reason?: string;
};

export default function UsernameAvailabilityHint({
  status,
  reason,
}: Props) {
  if (status === 'idle') return null;

  if (status === 'checking') {
    return (
      <p className="text-sm text-gray-500">
        Checking availability…
      </p>
    );
  }

  if (status === 'available') {
    return (
      <p className="text-sm text-green-600">
        ✓ Username is available
      </p>
    );
  }

  if (status === 'unavailable') {
    const msg =
      reason === 'reserved'
        ? 'This username is reserved'
        : 'This username is already taken';

    return (
      <p className="text-sm text-red-600">
        ✗ {msg}
      </p>
    );
  }

  if (status === 'error') {
    return (
      <p className="text-sm text-red-500">
        Unable to check username right now
      </p>
    );
  }

  return null;
}
