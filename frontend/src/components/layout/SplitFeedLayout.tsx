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
  <div
    className="
      min-h-screen
      h-screen
      flex
      flex-col
      bg-gray-100
    "
  >
    {/* ===== Header (fixed height) ===== */}
    <header
      className="
        shrink-0
        w-full
      "
    >
      {header}
    </header>

    {/* ===== Feed Area ===== */}
    <main
      className="
        flex-1
        min-h-0
        w-full
      "
    >
      <div
        className="
          h-full
          grid
          grid-cols-1
          lg:grid-cols-[minmax(0,1fr)_420px]
        "
      >
        {/* ===== LEFT: Text Feed (SCROLL) ===== */}
        <section
          className="
            h-full
            overflow-y-auto
            overscroll-contain
          "
          aria-label="Text feed"
        >
          {left}
        </section>

        {/* ===== RIGHT: Video Feed (SCROLL) ===== */}
        <aside
          className="
            hidden
            lg:block
            h-full
            overflow-y-auto
            overscroll-contain
            bg-black
          "
          aria-label="Video feed"
        >
          {right}
        </aside>
      </div>
    </main>
  </div>
);

}
