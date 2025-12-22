// frontend/components/common/FeedModeSwitcher.tsx
"use client";

import { useEffect, useState } from "react";

type Mode = "text" | "video";

export default function FeedModeSwitcher({
  onChange,
}: {
  onChange: (mode: Mode) => void;
}) {
  const [mode, setMode] = useState<Mode>("video");

  useEffect(() => {
    const saved = localStorage.getItem("feed:default");
    if (saved === "text" || saved === "video") {
      setMode(saved);
      onChange(saved);
    }
  }, [onChange]);

  function select(next: Mode) {
    setMode(next);
    localStorage.setItem("feed:default", next);
    onChange(next);
  }

 return (
  <div
    className="
      flex
      gap-2
      mb-2
      sm:mb-3
      lg:hidden
    "
    role="tablist"
    aria-label="Feed mode switcher"
  >
    <button
      type="button"
      onClick={() => select("video")}
      role="tab"
      aria-selected={mode === "video"}
      className={`
        flex-1
        rounded-lg
        py-2
        sm:py-2.5
        text-xs
        sm:text-sm
        font-medium
        transition
        ${
          mode === "video"
            ? "bg-black text-white"
            : "bg-white border border-gray-300 hover:bg-gray-50"
        }
      `}
    >
      🎬 วิดีโอ
    </button>

    <button
      type="button"
      onClick={() => select("text")}
      role="tab"
      aria-selected={mode === "text"}
      className={`
        flex-1
        rounded-lg
        py-2
        sm:py-2.5
        text-xs
        sm:text-sm
        font-medium
        transition
        ${
          mode === "text"
            ? "bg-black text-white"
            : "bg-white border border-gray-300 hover:bg-gray-50"
        }
      `}
    >
      📄 โพสต์
    </button>
  </div>
);

}
