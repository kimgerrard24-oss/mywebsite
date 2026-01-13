// frontend/src/components/profile/UsernameInput.tsx

import { useState } from 'react';
import { useUsernameAvailability } from '@/hooks/useUsernameAvailability';
import UsernameAvailabilityHint from '@/components/users/UsernameAvailabilityHint';

type Props = {
  defaultValue?: string;
  onChange?: (value: string) => void;
};

export default function UsernameInput({
  defaultValue = '',
  onChange,
}: Props) {
  const [value, setValue] = useState(defaultValue);

  const state = useUsernameAvailability(value);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const v = e.target.value;
    setValue(v);
    onChange?.(v);
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium">
        Username
      </label>

      <input
        value={value}
        onChange={handleChange}
        autoComplete="off"
        spellCheck={false}
        className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring"
        placeholder="yourname"
      />

      <UsernameAvailabilityHint
        status={state.status}
        reason={
          state.status === 'unavailable'
            ? state.reason
            : undefined
        }
      />
    </div>
  );
}
