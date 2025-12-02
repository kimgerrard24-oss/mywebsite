// ==============================
// file: frontend/lib/api.ts
// ==============================

// normalize API base
const rawBase =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://api.phlyphant.com";

const API_BASE = rawBase.replace(/\/+$/, "");

// safe join for paths
function apiPath(path: string): string {
  if (!path.startsWith("/")) return `${API_BASE}/${path}`;
  return `${API_BASE}${path}`;
}

// jsonFetch: default no credentials (caller decides)
async function jsonFetch<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const hasBody = typeof init?.body !== "undefined";

  const res = await fetch(input, {
    credentials: init?.credentials ?? "same-origin",

    ...init,
    headers: {
      Accept: "application/json",

      ...(hasBody ? { "Content-Type": "application/json" } : {}),

      ...(init?.headers ? (init.headers as Record<string, string>) : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let body = text;
    try {
      body = text ? JSON.parse(text) : text;
    } catch {}

    const err: any = new Error(`Request failed: ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return (await res.text()) as T;
  }
  return (await res.json()) as T;
}

// ==================================================
// Minimal axios-like client
// ==================================================
export const client = {
  post: <T = any>(path: string, data?: any) =>
    jsonFetch<T>(apiPath(path), {
      method: "POST",
      body: JSON.stringify(data ?? {}),
      credentials: "include",
    }),

  get: <T = any>(path: string) =>
    jsonFetch<T>(apiPath(path), {
      method: "GET",
      credentials: "include",
    }),
};

// ==================================================
// FIXED: correct backend endpoint (/auth/complete)
// ==================================================
export async function createSessionCookie(idToken: string) {
  return jsonFetch<{ ok: true }>(apiPath("/auth/local/complete"), {
    method: "POST",
    body: JSON.stringify({ idToken }),
    credentials: "include",
  });
}

export async function logout(): Promise<{ ok: true } | void> {
  return jsonFetch(apiPath("/auth/logout"), {
    method: "POST",
    credentials: "include",
  });
}

// ==================================================
// Session checks (SSR & Client)
// ==================================================
export async function sessionCheckServerSide(
  cookieHeader?: string
): Promise<{ valid: boolean; user?: any } | null> {
  const url = apiPath("/auth/local/session-check");

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",

    headers: {
      Accept: "application/json",

      // FIX — support both cases for safety
      ...(cookieHeader
        ? {
            cookie: cookieHeader,
            Cookie: cookieHeader,
          }
        : {}),
    },
  });

  if (!res.ok) {
    return { valid: false };
  }

  try {
    const data = (await res.json()) as Record<string, any>;
    return {
      valid: data.valid === true,
      ...data,
    };
  } catch {
    return { valid: false };
  }
}

export async function sessionCheckClient(): Promise<{
  valid: boolean;
  user?: any;
}> {
  const url = apiPath("/auth/local/session-check");
  const data = (await jsonFetch(url, { credentials: "include" })) as Record<
    string,
    any
  >;

  return {
    valid: data.valid === true,
    ...data,
  };
}

// ==================================================
export async function verifyEmail(token: string, uid: string) {
  return jsonFetch(apiPath(`/auth/local/verify-email?token=${token}&uid=${uid}`), {
    method: "GET",
    credentials: "include",
  });
}
