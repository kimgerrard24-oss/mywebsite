// backend/src/media/utils/build-cdn-url.util.ts

/**
 * Build public CDN URL from objectKey
 *
 * IMPORTANT:
 * - ใช้ public CDN base URL เท่านั้น (R2_PUBLIC_BASE_URL)
 * - ห้าม hardcode secret หรือ endpoint ภายใน
 * - objectKey ต้องไม่ขึ้นต้นด้วย '/'
 */
export function buildCdnUrl(objectKey: string): string {
  const baseUrl = process.env.R2_PUBLIC_BASE_URL;

  if (!baseUrl) {
    throw new Error('R2_PUBLIC_BASE_URL is not configured');
  }

  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const normalizedKey = objectKey.replace(/^\/+/, '');

  return `${normalizedBase}/${normalizedKey}`;
}
