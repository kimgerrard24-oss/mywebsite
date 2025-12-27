// frontend/src/components/chat/ChatLayout.tsx
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function ChatLayout({ children }: Props) {
  return (
    <main
      className="flex h-screen flex-col bg-white"
      aria-label="Chat page"
    >
      <section
        className="flex flex-1 flex-col"
        aria-label="Chat content"
      >
        {children}
      </section>
    </main>
  );
}
