// frontend/src/components/chat/ChatUnreadBadge.tsx

type Props = {
  count: number;
};

export default function ChatUnreadBadge({
  count,
}: Props) {
  if (count <= 0) return null;

  return (
    <span
      className="
        ml-auto
        min-w-[20px]
        rounded-full
        bg-red-500
        px-1.5
        py-0.5
        text-center
        text-xs
        font-semibold
        text-white
      "
      aria-label={`${count} unread messages`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
