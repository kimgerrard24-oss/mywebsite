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
    <div className="flex gap-2 lg:hidden mb-3">
      <button
        onClick={() => select("video")}
        className={`flex-1 rounded-lg py-2 text-sm
          ${mode === "video"
            ? "bg-black text-white"
            : "bg-white border"}`}
      >
        🎬 วิดีโอ
      </button>

      <button
        onClick={() => select("text")}
        className={`flex-1 rounded-lg py-2 text-sm
          ${mode === "text"
            ? "bg-black text-white"
            : "bg-white border"}`}
      >
        📄 โพสต์
      </button>
    </div>
  );
}
