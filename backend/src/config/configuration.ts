// config.ts (export default factory)
// Small defensive fixes to ensure env values are strings/numbers and
// callback/redirect fallbacks are consistent for Google/Facebook.

export default () => {
  const nodeEnv = process.env.NODE_ENV || 'development';

  const jwtSecret = process.env.JWT_SECRET || '';
  const jwtExpirySeconds = 60 * 60 * 24 * 7; // 7 days

  const sessionCookieName = process.env.SESSION_COOKIE_NAME || 'session';
  const sessionCookieMaxAgeMs = Number(
    process.env.SESSION_COOKIE_MAX_AGE_MS
      ? Number(process.env.SESSION_COOKIE_MAX_AGE_MS)
      : 432000000,
  );

  const cookieDomain =
    (process.env.COOKIE_DOMAIN && String(process.env.COOKIE_DOMAIN).trim()) ||
    (process.env.NODE_ENV === 'production' ? '.phlyphant.com' : '');

  const googleCallbackUrl =
    process.env.GOOGLE_CALLBACK_URL ||
    process.env.GOOGLE_REDIRECT_URL ||
    process.env.GOOGLE_REDIRECT_URI ||
    '';

  const googleRedirectUrl = googleCallbackUrl;

  const facebookCallbackUrl =
    process.env.FACEBOOK_CALLBACK_URL ||
    process.env.FACEBOOK_REDIRECT_URL ||
    '';

  const facebookRedirectUrl = facebookCallbackUrl;

  return {
    nodeEnv,
    jwtSecret,
    jwtExpirySeconds,
    sessionCookieName,
    sessionCookieMaxAgeMs,
    cookieDomain,
    google: {
      clientId: String(process.env.GOOGLE_CLIENT_ID || ''),
      clientSecret: String(process.env.GOOGLE_CLIENT_SECRET || ''),
      redirectUrl: String(googleRedirectUrl),
      callbackUrl: String(googleCallbackUrl),
      providerRedirectAfterLogin: String(
        process.env.GOOGLE_PROVIDER_REDIRECT_AFTER_LOGIN ||
          'https://www.phlyphant.com'
      ),
    },
    facebook: {
      clientId: String(process.env.FACEBOOK_CLIENT_ID || ''),
      clientSecret: String(process.env.FACEBOOK_CLIENT_SECRET || ''),
      redirectUrl: String(facebookRedirectUrl),
      callbackUrl: String(facebookCallbackUrl),
      providerRedirectAfterLogin: String(
        process.env.FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN ||
          'https://www.phlyphant.com'
      ),
    },
    firebaseBase64: String(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || ''),
    redisUrl: String(process.env.REDIS_URL || ''),
  };
};
