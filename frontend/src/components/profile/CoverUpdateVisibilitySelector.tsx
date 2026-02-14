// frontend/src/components/profile/CoverUpdateVisibilitySelector.tsx

"use client";

export default function CoverUpdateVisibilitySelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: any) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded-lg p-2"
    >
      <option value="PUBLIC">Public</option>
      <option value="FOLLOWERS">Followers</option>
      <option value="PRIVATE">Private</option>
    </select>
  );
}
