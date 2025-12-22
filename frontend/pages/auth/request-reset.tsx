// files pages/auth/request-reset.tsx
import { useState } from "react";
import { client } from "@/lib/api/api"; // แก้ตรงนี้เท่านั้น

export default function RequestReset() {
  const [email, setEmail] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await client.post("/auth/request-password-reset", { email });
    alert("If the email exists, a reset link was sent.");
  };

  return (
  <main
    className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-gray-50
      px-4
      py-8
      sm:px-6
    "
  >
    <section
      aria-labelledby="request-reset-heading"
      className="
        w-full
        max-w-sm
        sm:max-w-md
        rounded-lg
        sm:rounded-xl
        bg-white
        p-6
        sm:p-8
        shadow-md
      "
    >
      <header className="mb-5 sm:mb-6 text-center">
        <h1
          id="request-reset-heading"
          className="
            text-xl
            sm:text-2xl
            font-semibold
            text-gray-900
          "
        >
          Request Password Reset
        </h1>
      </header>

      <form
        onSubmit={submit}
        noValidate
        className="space-y-4 sm:space-y-5"
        aria-describedby="request-reset-help"
      >
        <div className="flex flex-col gap-1">
          <label
            htmlFor="email"
            className="
              text-xs
              sm:text-sm
              font-medium
              text-gray-700
            "
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-required="true"
            className="
              w-full
              rounded-md
              border
              border-gray-300
              px-3
              py-2
              text-sm
              shadow-sm
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-blue-500
              focus-visible:border-blue-500
            "
          />

          <p
            id="request-reset-help"
            className="
              text-[11px]
              sm:text-xs
              text-gray-500
            "
          >
            Enter the email associated with your account.
          </p>
        </div>

        <button
          type="submit"
          className="
            inline-flex
            w-full
            items-center
            justify-center
            rounded-md
            bg-blue-600
            px-4
            py-2.5
            text-sm
            font-medium
            text-white
            transition-colors
            hover:bg-blue-700
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-blue-500
            focus-visible:ring-offset-2
          "
        >
          Request
        </button>
      </form>
    </section>
  </main>
);

}

