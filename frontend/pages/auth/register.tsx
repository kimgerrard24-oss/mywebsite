// frontend/pages/auth/register.tsx

import RegisterForm from '../../src/components/forms/RegisterForm';
import Head from 'next/head';
import Script from 'next/script';

export default function RegisterPage() {
  return (
  <>
    <Head>
      <title>Register | PhlyPhant</title>
      <meta
        name="description"
        content="Create your account securely"
      />
    </Head>

    {/* Cloudflare Turnstile Script - client only */}
    <Script
      src="https://challenges.cloudflare.com/turnstile/v0/api.js"
      strategy="afterInteractive"
      async
      defer
    />

    <main
      className="
        mx-auto
        min-h-screen
        w-full
        max-w-sm
        sm:max-w-md
        px-4
        sm:px-6
        py-8
        sm:py-10
        bg-white
      "
    >
      <section
        aria-labelledby="register-heading"
        className="w-full"
      >
        <header className="mb-5 sm:mb-6 text-center">
          <h1
            id="register-heading"
            className="
              text-xl
              sm:text-2xl
              font-bold
              text-gray-900
            "
          >
            Create your PhlyPhant account
          </h1>
        </header>

        <section
          aria-label="Register form"
          className="w-full"
        >
          <RegisterForm />
        </section>
      </section>
    </main>
  </>
);

}
