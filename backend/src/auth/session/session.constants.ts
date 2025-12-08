// src/auth/session/session.constants.ts

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 นาที
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 วัน

// cookie name ที่ตรงกับของจริง
export const ACCESS_TOKEN_COOKIE_NAME = 'phl_access';
export const REFRESH_TOKEN_COOKIE_NAME = 'phl_refresh';

// Redis key prefix
export const ACCESS_TOKEN_KEY_PREFIX = 'session:access:';
export const REFRESH_TOKEN_KEY_PREFIX = 'session:refresh:';
