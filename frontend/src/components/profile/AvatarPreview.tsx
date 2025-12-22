// frontend/src/components/profile/AvatarPreview.tsx
type Props = {
  avatarUrl?: string | null;
};

export function AvatarPreview({ avatarUrl }: Props) {
 return (
  <img
    src={avatarUrl || "/avatar-placeholder.png"}
    alt="User avatar"
    width={128}
    height={128}
    loading="lazy"
    className="
      h-16
      w-16
      sm:h-24
      sm:w-24
      md:h-32
      md:w-32
      rounded-full
      object-cover
    "
  />
);

}

