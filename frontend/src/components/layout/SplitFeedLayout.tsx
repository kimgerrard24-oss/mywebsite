// frontend/components/layout/SplitFeedLayout.tsx

import { ReactNode } from "react";

type Props = {
  header: ReactNode;
  left: ReactNode;
  right: ReactNode;
};

export default function SplitFeedLayout({
  header,
  left,
  right,
}: Props) {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* ===== Header (fixed height) ===== */}
      <div className="shrink-0">
        {header}
      </div>

      {/* ===== Feed Area ===== */}
      <div className="flex-1 min-h-0">
        <div className="h-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px]">
          
          {/* ===== LEFT: Text Feed (SCROLL) ===== */}
          <section className="overflow-y-auto">
            {left}
          </section>

          {/* ===== RIGHT: Video Feed (SCROLL) ===== */}
          <aside className="hidden lg:block overflow-y-auto bg-black">
            {right}
          </aside>

        </div>
      </div>
    </div>
  );
}
