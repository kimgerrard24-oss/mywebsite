import { useRouter } from "next/router";
import { useEffect } from "react";
import { verifyEmail } from "@/lib/api";

export default function VerifyEmail() {
  const router = useRouter();
  const { token, uid } = router.query;

  useEffect(() => {
    if (!token || !uid) return;

    (async () => {
      try {
        await verifyEmail(token as string, uid as string);
        alert("Email verified");
        router.push("/auth/login");
      } catch {
        alert("Verification failed");
      }
    })();
  }, [token, uid]);

  return <main><p>Verifying...</p></main>;
}
