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

// Require environment variable
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Exchange authorization code for tokens -----------------------------
export async function exchangeGoogleCodeForTokens(code: string): Promise<GoogleTokens> {
  const clientId = requireEnv('GOOGLE_CLIENT_ID');
  const clientSecret = requireEnv('GOOGLE_CLIENT_SECRET');
  const redirectUri = requireEnv('GOOGLE_REDIRECT_URL');

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

// Fetch user profile --------------------------------------------------
export async function fetchGoogleProfile(idToken?: string, accessToken?: string) {
  const userInfoUrl = 'https://www.googleapis.com/oauth2/v3/userinfo';

  if (!accessToken) {
    throw new Error('Missing Google accessToken');
  }

  try {
    const res = await axios.get<GoogleUserInfo>(userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      timeout: 10000,
    });

    return normalizeGoogleProfile(res.data);
  } catch (err: any) {
    const detail = err?.response?.data || err?.message || 'Unknown error';
    throw new Error(`Google Profile Fetch Failed: ${JSON.stringify(detail)}`);
  }
}

// Normalize for Hybrid OAuth + Firebase Admin Usage ------------------
function normalizeGoogleProfile(data: GoogleUserInfo) {
  return {
    provider: 'google',
    providerId: data.sub,
    name: data.name || null,
    email: data.email || null,
    picture: data.picture || null,
  };
}
