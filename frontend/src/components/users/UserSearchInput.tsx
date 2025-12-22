// frontend/components/users/UserSearchInput.tsx

import { useEffect, useState } from "react";

type Props = {
  onSearch: (value: string) => void;

  /**
   * ใช้ควบคุม UX
   * - "navbar" → compact input
   * - "feed" / "page" → default
   */
  variant?: "feed" | "page" | "navbar";
};

export default function UserSearchInput({
  onSearch,
  variant = "page",
}: Props) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(value.trim());
    }, 400); // debounce 400ms (production-safe)

    return () => clearTimeout(handler);
  }, [value, onSearch]);

  const isNavbar = variant === "navbar";

  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className={isNavbar ? "w-full" : ""}
    >
      <label
        htmlFor="user-search"
        className="sr-only"
      >
        Search users
      </label>

      <input
        id="user-search"
        type="search"
        inputMode="search"
        placeholder="Search users…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={
          isNavbar
            ? `
              w-full
              h-9
              rounded-md
              border border-gray-300
              px-3
              text-sm
              focus:border-black
              focus:outline-none
            `
            : `
              w-full
              rounded-lg
              border border-gray-300
              px-4 py-2
              text-sm
              focus:border-black
              focus:outline-none
            `
        }
        maxLength={50}
        autoComplete="off"
      />
    </form>
  );
}
