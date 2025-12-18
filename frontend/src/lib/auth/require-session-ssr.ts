// frontend/src/lib/auth/require-session-ssr.ts
import type { GetServerSidePropsContext } from "next";
import { api } from "@/lib/api/api";

export async function requireSessionSSR(
  ctx: GetServerSidePropsContext,
  options?: { optional?: boolean },
) {
  try {
    await api.get("/auth/session-check", {
      headers: {
        cookie: ctx.req.headers.cookie || "",
      },
      withCredentials: true,
    });
  } catch {
    if (!options?.optional) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }
  }

  return null;
}

