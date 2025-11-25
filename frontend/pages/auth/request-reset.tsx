// files pages/auth/request-reset.tsx
import { useState } from "react";
import { client } from "@/lib/api"; // แก้ตรงนี้เท่านั้น

export default function RequestReset() {
  const [email, setEmail] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await client.post("/auth/request-password-reset", { email });
    alert("If the email exists, a reset link was sent.");
  };

  return (
    <main>
      <h1>Request Password Reset</h1>
      <form onSubmit={submit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <button type="submit">Request</button>
      </form>
    </main>
  );
}

