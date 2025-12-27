// frontend/src/components/chat/ChatComposerError.tsx
type Props = {
  message: string;
};

export default function ChatComposerError({
  message,
}: Props) {
  return (
    <div
      className="mb-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600"
      role="alert"
    >
      {message}
    </div>
  );
}
