// frontend/pages/settings/set-password.tsx
import Head from "next/head";
import type { GetServerSideProps } from "next";

import RequestSetPasswordForm from "@/components/auth/RequestSetPasswordForm";
import SetPasswordForm from "@/components/auth/SetPasswordForm";

type Props = {
  token: string | null;
};

export default function SetPasswordPage({ token }: Props) {
  const isConfirmMode = Boolean(token);

  return (
    <>
      <Head>
        <title>
          {isConfirmMode
            ? "Confirm Password Setup | PhlyPhant"
            : "Set Your Password | PhlyPhant"}
        </title>

        <meta
          name="description"
          content={
            isConfirmMode
              ? "Confirm and set your password for your PhlyPhant account."
              : "Set a password for your PhlyPhant account to enable sensitive security features."
          }
        />

        {/* 🔐 security: do not index password-related pages */}
        <meta name="robots" content="noindex,nofollow" />

        {/* 🔐 prevent referrer leaking token in URL */}
        <meta name="referrer" content="no-referrer" />

        {/* 🔐 cache hardening (browser + proxy) */}
        <meta
          httpEquiv="Cache-Control"
          content="no-store, no-cache, must-revalidate, proxy-revalidate"
        />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />

        {/* SEO hygiene (even if noindex) */}
        <link
          rel="canonical"
          href="https://www.phlyphant.com/settings/set-password"
        />
      </Head>

      <main className="mx-auto max-w-md px-4 py-12">
        {!isConfirmMode ? (
          <>
            <h1 className="mb-2 text-2xl font-semibold">
              Set your password
            </h1>

            <p className="mb-6 text-sm text-gray-500">
              To protect your account and use sensitive features, you
              need to set a password. We will send a secure link to your
              email.
            </p>

            {/* ✅ existing behavior (unchanged) */}
            <RequestSetPasswordForm />
          </>
        ) : (
          <>
            <h1 className="mb-2 text-2xl font-semibold">
              Confirm your password
            </h1>

            <p className="mb-6 text-sm text-gray-500">
              Please choose a strong password to secure your account.
            </p>

            {/* ✅ new behavior: confirm-set-password */}
            <SetPasswordForm token={token!} />
          </>
        )}
      </main>
    </>
  );
}

/* ============================
   SSR — TOKEN ONLY (NO AUTH)
   ============================ */
export const getServerSideProps: GetServerSideProps<Props> =
  async ({ query, res }) => {
    let token =
      typeof query.token === "string" ? query.token : null;

    // -------------------------------------------------
    // 🔐 Basic hardening against malformed tokens
    // -------------------------------------------------
    if (token) {
      const trimmed = token.trim();

      // empty / suspiciously long → treat as invalid
      if (trimmed.length === 0 || trimmed.length > 512) {
        token = null;
      } else {
        token = trimmed;
      }
    }

    // -------------------------------------------------
    // 🔐 Prevent any caching of this HTML page
    // -------------------------------------------------
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    return {
      props: { token },
    };
  };
