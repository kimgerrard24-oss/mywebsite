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
    className={`
      ${isNavbar ? "w-full" : "w-full"}
    `}
    aria-label="Search users"
  >
    <label htmlFor="user-search" className="sr-only">
      Search users
    </label>

    <input
      id="user-search"
      type="search"
      inputMode="search"
      placeholder="Search users…"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      maxLength={50}
      autoComplete="off"
      className={
        isNavbar
          ? `
            w-full
            h-8
            sm:h-9
            rounded-md
            border
            border-gray-300
            px-3
            text-xs
            sm:text-sm
            focus:border-black
            focus:outline-none
            transition
          `
          : `
            w-full
            rounded-lg
            border
            border-gray-300
            px-3
            sm:px-4
            py-1.5
            sm:py-2
            text-sm
            sm:text-base
            focus:border-black
            focus:outline-none
            transition
          `
      }
    />
  </form>
);

}
