// frontend/pages/auth/register.tsx

import RegisterForm from '../../src/components/forms/RegisterForm';
import Head from 'next/head';

export default function RegisterPage() {
  return (
    <>
      <Head>
        <title>Register | PhlyPhant</title>
        <meta name="description" content="Create your account securely" />
      </Head>

      <main className="max-w-md mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Create Account</h1>
        <RegisterForm />
      </main>
    </>
  );
}
