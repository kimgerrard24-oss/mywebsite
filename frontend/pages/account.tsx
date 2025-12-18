// frontend/pages/account.tsx

import React from "react";
import type { GetServerSideProps } from "next";

import { sessionCheckServerSide } from "@/lib/api/api";
import LogoutButton from "@/components/auth/LogoutButton";

type Props = {
  user: any | null;
  valid: boolean;
};

export default function AccountPage({ user, valid }: Props) {
  if (!valid) {
    return (
      <div style={{ padding: 24 }}>
        <h1>ต้องเข้าสู่ระบบ</h1>
        <p>คุณจะต้องเข้าสู่ระบบก่อนเข้าถึงหน้านี้</p>
        <a href="/">ไปที่หน้าเข้าสู่ระบบ</a>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>บัญชีของคุณ</h1>

      <p>ยินดีต้อนรับ, {user?.name || user?.email || "ผู้ใช้"}</p>

      <pre>{JSON.stringify(user, null, 2)}</pre>

      <LogoutButton />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const cookieHeader = ctx.req.headers.cookie ?? undefined;

  try {
    // 1) Session check = AUTHORITY
    const sessionResult = await sessionCheckServerSide(cookieHeader);

    if (!sessionResult || sessionResult.valid !== true) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    // 2) Session valid → try fetch user (FAIL-SOFT)
    const baseUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE ||
      "https://api.phlyphant.com";

    const apiUrl = `${baseUrl.replace(/\/+$/, "")}/users/me`;

    let user: any | null = null;

    try {
      const res = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json().catch(() => null);

        if (json?.data && typeof json.data === "object") {
          user = json.data;
        } else if (json?.id) {
          user = json;
        }
      }
    } catch {
      // ignore — page can render without full profile
    }

    return {
      props: {
        valid: true,
        user,
      },
    };
  } catch {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  
};
