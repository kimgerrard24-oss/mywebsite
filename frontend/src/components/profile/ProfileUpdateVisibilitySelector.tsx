// frontend/src/components/profile/ProfileUpdateVisibilitySelector.tsx

"use client";

export default function ProfileUpdateVisibilitySelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: any) => void;
}) {
  return (
    <select
      className="border rounded-lg p-2"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="PUBLIC">Public</option>
      <option value="FOLLOWERS">Followers</option>
      <option value="PRIVATE">Private</option>
    </select>
  );
}
