// frontend/src/components/chat/ChatMessageLoader.tsx
type Props = {
  loading: boolean;
  onLoadMore: () => void;
};

export default function ChatMessageLoader({
  loading,
  onLoadMore,
}: Props) {
  return (
    <button
      onClick={onLoadMore}
      disabled={loading}
      className="mx-auto mb-3 text-xs text-gray-500"
    >
      {loading ? "Loading..." : "Load more"}
    </button>
  );
}
