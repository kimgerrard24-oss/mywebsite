// frontend/lib/api.ts
// Small API wrapper for auth endpoints. Uses credentials: 'include' to forward cookies.

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.phlyphant.com';

async function jsonFetch<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, {
    credentials: 'include', // important to include cookies
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init && init.headers ? (init.headers as Record<string, string>) : {}),
    },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let body = text;
    try {
      body = text ? JSON.parse(text) : text;
    } catch (e) {
      // ignore
    }
    const err: any = new Error(`Request failed: ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  // handle empty body
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    // @ts-ignore
    return (await res.text()) as T;
  }
  return (await res.json()) as T;
}

export async function createSessionCookie(idToken: string) {
  // POST /auth/session  body { idToken }
  return jsonFetch<{ ok: true }>(`${API_BASE}/auth/session`, {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
}

export async function logout(): Promise<{ ok: true } | void> {
  return jsonFetch(`${API_BASE}/auth/logout`, { method: 'POST' });
}

export async function sessionCheckServerSide(
  cookieHeader?: string
): Promise<{ valid: boolean; user?: any } | null> {
  // For SSR: call session-check with cookie header forwarded
  const url = `${API_BASE}/auth/session-check`;
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      // forward cookie if provided (in server-side context)
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
  });

  if (!res.ok) {
    return { valid: false };
  }
  try {
    const data = await res.json();
    return data;
  } catch {
    return { valid: false };
  }
}

export async function sessionCheckClient(): Promise<{ valid: boolean; user?: any }> {
  const url = `${API_BASE}/auth/session-check`;
  return jsonFetch(url);
}
