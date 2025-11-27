// files pages/auth/rest-password.tsx
import { useState } from "react";
import { client } from "@/lib/api"; // แก้ตรงนี้
import { useRouter } from "next/router";

export default function ResetPassword() {
  const router = useRouter();
  const { token, uid } = router.query;
  const [password, setPassword] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await client.post("/auth/reset-password", { token, uid, newPassword: password });
    alert("Password reset OK");
    router.push("/auth/login");
  };

  return (
    <main>
      <h1>Reset Password</h1>
      <form onSubmit={submit}>
        <label>
          New password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>
        <button type="submit">Reset</button>
      </form>
    </main>
  );
}
