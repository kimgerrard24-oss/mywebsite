// ==========================================
// file: src/oauth/google.client.ts
// ==========================================

import axios from 'axios';

export interface GoogleTokens {
  access_token: string;
  id_token?: string;
  refresh_token?: string;
  expires_in?: number;
}

interface GoogleUserInfo {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
}

// ---------------------------------------------------------------------
// Safe ENV loader (no emoji, no crash, returns empty string if missing)
// ---------------------------------------------------------------------
function safeEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    console.warn(`Missing environment variable: ${name}`);
    return '';
  }
  return value.trim();
}

// ---------------------------------------------------------------------
// Exchange authorization code for tokens
// ---------------------------------------------------------------------
export async function exchangeGoogleCodeForTokens(
  code: string
): Promise<GoogleTokens> {
  const clientId = safeEnv('GOOGLE_CLIENT_ID');
  const clientSecret = safeEnv('GOOGLE_CLIENT_SECRET');

  // Normalize redirectUri — prioritize CALLBACK over REDIRECT
  const redirectUriRaw =
    process.env.GOOGLE_CALLBACK_URL ||
    process.env.GOOGLE_REDIRECT_URL ||
    process.env.GOOGLE_REDIRECT_URI ||
    '';

  const redirectUri = redirectUriRaw.trim();

  if (!clientId || !clientSecret || !redirectUri) {
    const missing = [];
    if (!clientId) missing.push('GOOGLE_CLIENT_ID');
    if (!clientSecret) missing.push('GOOGLE_CLIENT_SECRET');
    if (!redirectUri) missing.push('GOOGLE_CALLBACK_URL / GOOGLE_REDIRECT_URL');
    throw new Error(
      `Google OAuth configuration missing: ${missing.join(', ')}`
    );
  }

  const tokenUrl = 'https://oauth2.googleapis.com/token';

  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });

  try {
    const res = await axios.post(tokenUrl, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10000,
    });

    return res.data as GoogleTokens;
  } catch (err: any) {
    const detail = err?.response?.data || err?.message || 'Unknown error';
    throw new Error(`Google Token Exchange Failed: ${JSON.stringify(detail)}`);
  }
}

// ---------------------------------------------------------------------
// Fetch user profile
// ---------------------------------------------------------------------
export async function fetchGoogleProfile(
  idToken?: string,
  accessToken?: string
) {
  const userInfoUrl = 'https://www.googleapis.com/oauth2/v3/userinfo';

  if (!accessToken && !idToken) {
    throw new Error('Missing Google accessToken or idToken');
  }

  try {
    const headers: Record<string, string> = {};

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    } else if (idToken) {
      headers['Authorization'] = `Bearer ${idToken}`;
    }

    const res = await axios.get<GoogleUserInfo>(userInfoUrl, {
      headers,
      timeout: 10000,
    });

    return normalizeGoogleProfile(res.data);
  } catch (err: any) {
    const detail = err?.response?.data || err?.message || 'Unknown error';
    throw new Error(
      `Google Profile Fetch Failed: ${JSON.stringify(detail)}`
    );
  }
}

// ---------------------------------------------------------------------
// Normalize for Hybrid OAuth + Firebase Admin Usage
// ---------------------------------------------------------------------
function normalizeGoogleProfile(data: GoogleUserInfo) {
  return {
    provider: 'google',
    providerId: data.sub,
    name: data.name || null,
    email: data.email || null,
    picture: data.picture || null,
  };
}
