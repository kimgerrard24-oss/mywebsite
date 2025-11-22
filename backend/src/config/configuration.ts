export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpirySeconds: 60 * 60 * 24 * 7, // 7 days (adjust if needed)
  sessionCookieName: process.env.SESSION_COOKIE_NAME || 'session',
  sessionCookieMaxAgeMs: Number(process.env.SESSION_COOKIE_MAX_AGE_MS || 432000000),
  cookieDomain: process.env.COOKIE_DOMAIN,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUrl: process.env.GOOGLE_REDIRECT_URL,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
    providerRedirectAfterLogin: process.env.GOOGLE_PROVIDER_REDIRECT_AFTER_LOGIN,
  },
  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    redirectUrl: process.env.FACEBOOK_REDIRECT_URL,
    callbackUrl: process.env.FACEBOOK_CALLBACK_URL,
    providerRedirectAfterLogin: process.env.FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN,
  },
  firebaseBase64: process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
  redisUrl: process.env.REDIS_URL,
});
