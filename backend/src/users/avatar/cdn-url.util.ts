// backend/src/users/avatar/cdn-url.util.ts
/**
 * Build public CDN URL for user assets (avatar / cover)
 *
 * - ใช้เฉพาะ public object เท่านั้น
 * - ห้ามใช้กับ private bucket
 * - ห้าม sign URL ที่นี่
 */
export function buildCdnUrl(objectPath: string): string {
  const base = process.env.R2_PUBLIC_BASE_URL;

  if (!base) {
    // Fail-fast: config ผิด = ไม่ควร deploy
    throw new Error('R2_PUBLIC_BASE_URL is not configured');
  }

  const normalizedBase = base.replace(/\/+$/, '');
  const normalizedPath = objectPath.replace(/^\/+/, '');

  return `${normalizedBase}/${normalizedPath}`;
}
