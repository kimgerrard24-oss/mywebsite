// frontend/components/layout/SplitFeedLayout.tsx
import { ReactNode } from "react";

type Props = {
  left: ReactNode;
  right: ReactNode;
};

export default function SplitFeedLayout({ left, right }: Props) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ===== Left: Text Feed ===== */}
          <main
            className="lg:col-span-2"
            aria-label="Text feed"
          >
            {left}
          </main>

          {/* ===== Right: Short Video Feed ===== */}
          <aside
            className="hidden lg:block"
            aria-label="Short video feed"
          >
            {right}
          </aside>

        </div>
      </div>
    </div>
  );
}
