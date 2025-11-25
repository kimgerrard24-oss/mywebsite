// frontend/lib/api.ts
// Small API wrapper for auth endpoints. Uses credentials: 'include' to forward cookies.

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://api.phlyphant.com";

async function jsonFetch<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init && init.headers ? (init.headers as Record<string, string>) : {}),
    },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let body = text;
    try {
      body = text ? JSON.parse(text) : text;
    } catch (e) {}

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
// FIXED: correct backend endpoint (/auth/complete)
// ==================================================
export async function createSessionCookie(idToken: string) {
  return jsonFetch<{ ok: true }>(`${API_BASE}/auth/complete`, {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
}

export async function logout(): Promise<{ ok: true } | void> {
  return jsonFetch(`${API_BASE}/auth/logout`, { method: "POST" });
}

// ==================================================
// Session check — works correctly with backend shape
// ==================================================
export async function sessionCheckServerSide(
  cookieHeader?: string
): Promise<{ valid: boolean; user?: any } | null> {
  const url = `${API_BASE}/auth/session-check`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
  });

  if (!res.ok) {
    return { valid: false };
  }

  try {
    const data = (await res.json()) as Record<string, any>;
    const valid = data.valid === true;

    return {
      valid,
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
  const url = `${API_BASE}/auth/session-check`;
  const data = (await jsonFetch(url)) as Record<string, any>;

  const valid = data.valid === true;

  return {
    valid,
    ...data,
  };
}
