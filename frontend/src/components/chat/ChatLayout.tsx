// frontend/src/components/chat/ChatLayout.tsx
import { ReactNode } from "react";

type Props = {
  header: ReactNode;
  messages: ReactNode;
  composer: ReactNode;
};

export default function ChatLayout({
  header,
  messages,
  composer,
}: Props) {
  return (
    <main
      className="flex h-screen flex-col bg-white"
      aria-label="Chat page"
    >
      {/* 🔒 Sticky Header */}
      <div className="sticky top-0 z-30 bg-white">
        {header}
      </div>

      {/* 🔽 Scrollable Messages */}
      <section
        className="flex-1 overflow-y-auto"
        aria-label="Chat messages"
      >
        {messages}
      </section>

      {/* ⌨️ Composer */}
      <div className="sticky bottom-0 z-20 bg-white">
        {composer}
      </div>
    </main>
  );
}
