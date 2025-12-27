// frontend/src/components/chat/ChatReportButton.tsx
import { useState } from 'react';
import ChatReportModal from './ChatReportModal';

type Props = {
  chatId: string;
};

export default function ChatReportButton({
  chatId,
}: Props) {
  const [open, setOpen] =
    useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-red-500 hover:underline"
      >
        Report chat
      </button>

      {open && (
        <ChatReportModal
          chatId={chatId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
