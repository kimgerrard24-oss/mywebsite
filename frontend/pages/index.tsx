// ==============================
// file: pages/index.tsx
// ==============================
import Link from "next/link";

export default function Home() {
  // Production Frontend URL (จาก .env)
  const FRONTEND =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://phlyphant.com";

  // Production Backend API URL (จาก .env)
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE ||
    "https://api.phlyphant.com";

  // Google Login URL (Hybrid OAuth + Firebase Admin)
  const googleLoginUrl = `${API_BASE}/auth/google?origin=${encodeURIComponent(
    FRONTEND
  )}`;

  // Facebook Login URL (Hybrid OAuth + Firebase Admin)
  const facebookLoginUrl = `${API_BASE}/auth/facebook?origin=${encodeURIComponent(
    FRONTEND
  )}`;

  return (
    <main style={{ padding: 32 }}>
      <h1>Login</h1>

      {/* Google Login */}
      <a href={googleLoginUrl} style={{ display: "block", marginTop: 16 }}>
        Login with Google
      </a>

      {/* Facebook Login */}
      <a href={facebookLoginUrl} style={{ display: "block", marginTop: 12 }}>
        Login with Facebook
      </a>

      {/* Optional link for checking session */}
      <br />
      <Link href="/auth-check">Go to Auth Check</Link>
    </main>
  );
}
