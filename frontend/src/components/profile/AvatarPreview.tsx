// frontend/src/components/profile/AvatarPreview.tsx
type Props = {
  avatarUrl?: string | null;
};

export function AvatarPreview({ avatarUrl }: Props) {
  return (
    <img
      src={avatarUrl || '/avatar-placeholder.png'}
      alt="User avatar"
      width={128}
      height={128}
      loading="lazy"
      className="h-32 w-32 rounded-full object-cover"
    />
  );
}

