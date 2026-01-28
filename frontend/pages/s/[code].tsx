// frontend/pages/s/[code].tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";

import { resolveShareLinkSSR } from "@/lib/api/share-links";

type Props = {
  redirectUrl?: string;
  error?: "NOT_FOUND" | "FORBIDDEN" | "EXPIRED";
};

export default function ShareRedirectPage({
  redirectUrl,
  error,
}: Props) {
  return (
    <>
      <Head>
        <title>PhlyPhant</title>
        <meta
          name="robots"
          content="noindex, nofollow"
        />
      </Head>

      <main
        className="
          min-h-screen
          flex
          items-center
          justify-center
          px-4
        "
      >
        <div className="text-center space-y-3">
          {!error && (
            <>
              <p className="text-gray-600">
                กำลังเปิดโพสต์…
              </p>
              <div className="animate-pulse text-sm text-gray-400">
                Redirecting
              </div>
            </>
          )}

          {error === "NOT_FOUND" && (
            <>
              <h1 className="text-lg font-semibold">
                ไม่พบลิงก์นี้
              </h1>
              <p className="text-sm text-gray-500">
                ลิงก์อาจถูกลบหรือไม่ถูกต้อง
              </p>
            </>
          )}

          {error === "EXPIRED" && (
            <>
              <h1 className="text-lg font-semibold">
                ลิงก์หมดอายุหรือถูกปิดใช้งาน
              </h1>
              <p className="text-sm text-gray-500">
                ไม่สามารถเปิดโพสต์จากลิงก์นี้ได้
              </p>
            </>
          )}

          {error === "FORBIDDEN" && (
            <>
              <h1 className="text-lg font-semibold">
                ไม่สามารถเข้าถึงโพสต์นี้ได้
              </h1>
              <p className="text-sm text-gray-500">
                อาจเป็นเพราะการตั้งค่าความเป็นส่วนตัว
              </p>
            </>
          )}
        </div>
      </main>
    </>
  );
}

/* ================= SSR ================= */

export const getServerSideProps: GetServerSideProps<Props> =
  async (ctx) => {
    const code = ctx.params?.code;

    if (typeof code !== "string") {
      return { notFound: true };
    }

    try {
      const result =
        await resolveShareLinkSSR(code, ctx);

      if (!result) {
        return {
          props: { error: "NOT_FOUND" },
        };
      }

      return {
        redirect: {
          destination: result.redirectUrl,
          permanent: false,
        },
      };
    } catch (err: any) {
      const status =
        err?.response?.status ?? null;

      if (status === 404) {
        return { props: { error: "NOT_FOUND" } };
      }

      if (status === 410) {
        return { props: { error: "EXPIRED" } };
      }

      if (status === 403) {
        return { props: { error: "FORBIDDEN" } };
      }

      return { notFound: true };
    }
  };
