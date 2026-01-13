// frontend/pages/settings/verify.tsx

import Head from "next/head";
import { useRouter } from "next/router";
import VerifyCredentialForm from "@/components/security/VerifyCredentialForm";

export default function VerifyCredentialPage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Verify Identity | PhlyPhant</title>
      </Head>

      <main className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-xl font-semibold">
          Security verification
        </h1>

        <p className="mt-1 text-sm text-gray-600">
          Please confirm your password to continue
        </p>

        <div className="mt-6">
          <VerifyCredentialForm
            onSuccess={() => {
              // 👉 หลัง verify สำเร็จ ไป step ถัดไป
              router.replace("/settings/email");
            }}
          />
        </div>
      </main>
    </>
  );
}
