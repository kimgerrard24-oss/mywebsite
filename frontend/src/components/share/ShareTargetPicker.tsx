// frontend/src/components/share/ShareTargetPicker.tsx

import { useState } from "react";

type Props = {
  onSelectUser: (userId: string) => void;
  onSelectChat: (chatId: string) => void;
};

export default function ShareTargetPicker({
  onSelectUser,
  onSelectChat,
}: Props) {
  const [mode, setMode] =
    useState<"user" | "chat">("user");
  const [value, setValue] = useState("");

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("user")}
          className={
            mode === "user"
              ? "font-semibold"
              : "text-gray-500"
          }
        >
          User
        </button>
        <button
          type="button"
          onClick={() => setMode("chat")}
          className={
            mode === "chat"
              ? "font-semibold"
              : "text-gray-500"
          }
        >
          Chat
        </button>
      </div>

      <input
        value={value}
        onChange={(e) =>
          setValue(e.target.value)
        }
        placeholder={
          mode === "user"
            ? "Enter userId"
            : "Enter chatId"
        }
        className="
          w-full
          border
          rounded
          px-3
          py-2
        "
      />

      <button
        type="button"
        onClick={() => {
          if (!value) return;

          if (mode === "user") {
            onSelectUser(value);
          } else {
            onSelectChat(value);
          }
        }}
        className="
          w-full
          bg-blue-600
          text-white
          rounded
          py-2
        "
      >
        Select
      </button>
    </div>
  );
}
