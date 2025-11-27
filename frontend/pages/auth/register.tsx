import { useState } from "react";
import { client } from "@/lib/api"; // แก้เฉพาะตรงนี้
import { useRouter } from "next/router";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await client.post("/auth/register", { email, password });
      alert("Registered. Check your email to verify.");
      router.push("/auth/login");
    } catch (err: unknown) {
      const error = err as any;
      alert(error?.response?.data?.message || "Error");
    }
  };

  return (
    <main>
      <h1>Register</h1>
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

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>

        <button type="submit">Register</button>
      </form>
    </main>
  );
}
