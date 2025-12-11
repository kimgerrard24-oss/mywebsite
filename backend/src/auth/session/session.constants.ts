// Default TTL in seconds
export const ACCESS_TOKEN_TTL_SECONDS = process.env.ACCESS_TOKEN_TTL_SECONDS
  ? parseInt(process.env.ACCESS_TOKEN_TTL_SECONDS)
  : 15 * 60; // Default 15 minutes
export const REFRESH_TOKEN_TTL_SECONDS = process.env.REFRESH_TOKEN_TTL_SECONDS
  ? parseInt(process.env.REFRESH_TOKEN_TTL_SECONDS)
  : 7 * 24 * 60 * 60; // Default 7 days

// cookie name ที่ตรงกับของจริง
export const ACCESS_TOKEN_COOKIE_NAME = 'phl_access';
export const REFRESH_TOKEN_COOKIE_NAME = 'phl_refresh';

// Redis key prefix
export const ACCESS_TOKEN_KEY_PREFIX = 'session:access:';
export const REFRESH_TOKEN_KEY_PREFIX = 'session:refresh:';
