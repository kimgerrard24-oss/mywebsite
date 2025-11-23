// ==========================================
// file: src/oauth/facebook.client.ts
// ==========================================

import axios from 'axios';

interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface FacebookProfileResponse {
  id: string;
  name?: string;
  email?: string;
  picture?: {
    data?: {
      url?: string;
    };
  };
}

// Safe ENV loader for production
function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

// Facebook Graph API Version
const GRAPH_VERSION = 'v21.0';

// ---------------------------------------------------------------------
// Exchange code → access token
// ---------------------------------------------------------------------
export async function exchangeFacebookCodeForTokens(code: string) {
  const clientId = requireEnv('FACEBOOK_CLIENT_ID');
  const clientSecret = requireEnv('FACEBOOK_CLIENT_SECRET');

  // ใช้ callback ที่ถูกต้อง
  const redirectUri = requireEnv('FACEBOOK_CALLBACK_URL');

  const tokenUrl = `https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token`;

  try {
    const res = await axios.get<FacebookTokenResponse>(tokenUrl, {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      },
      timeout: 10000,
    });

    return res.data;
  } catch (err: any) {
    const detail = err?.response?.data || err?.message || 'Unknown error';
    throw new Error(
      `Facebook Token Exchange Failed: ${JSON.stringify(detail)}`
    );
  }
}

// ---------------------------------------------------------------------
// Fetch Facebook user profile
// ---------------------------------------------------------------------
export async function fetchFacebookProfile(accessToken: string) {
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/me`;

  try {
    const res = await axios.get<FacebookProfileResponse>(url, {
      params: {
        fields: 'id,name,email,picture',
        access_token: accessToken,
      },
      timeout: 10000,
    });

    return normalizeFacebookProfile(res.data);
  } catch (err: any) {
    const detail = err?.response?.data || err?.message || 'Unknown error';
    throw new Error(
      `Facebook Profile Fetch Failed: ${JSON.stringify(detail)}`
    );
  }
}

// ---------------------------------------------------------------------
// Normalize result
// ---------------------------------------------------------------------
function normalizeFacebookProfile(data: FacebookProfileResponse) {
  return {
    provider: 'facebook',
    providerId: data.id,
    name: data.name || null,
    email: data.email || null,
    picture: data.picture?.data?.url || null,
  };
}
