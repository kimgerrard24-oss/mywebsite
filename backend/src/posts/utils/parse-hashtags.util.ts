/**
 * parse-hashtags.util.ts
 *
 * Production-grade hashtag parser
 *
 * - รองรับภาษาไทย + อังกฤษ
 * - normalize เป็น lowercase
 * - ตัด #
 * - deduplicate
 * - จำกัดจำนวน / ความยาว (anti-spam)
 * - fail-safe (ไม่ throw)
 */

/**
 * Configuration (ปรับได้ตาม policy)
 */
const MAX_HASHTAGS_PER_POST = 5;
const MAX_HASHTAG_LENGTH = 30;

/**
 * Unicode-safe hashtag regex
 *
 * - \p{L}  : letters (รองรับภาษาไทย)
 * - \p{N}  : numbers
 * - ต้องใช้ flag `u`
 *
 * Match ตัวอย่าง:
 *   #test
 *   #NestJS
 *   #ภาษาไทย
 */
const HASHTAG_REGEX = /#([\p{L}\p{N}_]+)/gu;

/**
 * Parse hashtags from post content
 *
 * @param content raw post content
 * @returns normalized hashtag names (no #, lowercase)
 *
 * @example
 * parseHashtags("Hello #Test #ภาษาไทย")
 * // => ["test", "ภาษาไทย"]
 */
export function parseHashtags(
  content: string | null | undefined,
): string[] {
  if (!content || typeof content !== 'string') {
    return [];
  }

  try {
    const matches = content.matchAll(HASHTAG_REGEX);

    const tags: string[] = [];

    for (const match of matches) {
      const raw = match[1];
      if (!raw) continue;

      const normalized = raw
        .trim()
        .toLowerCase();

      // guard: length
      if (
        normalized.length === 0 ||
        normalized.length > MAX_HASHTAG_LENGTH
      ) {
        continue;
      }

      tags.push(normalized);

      // guard: limit count early
      if (tags.length >= MAX_HASHTAGS_PER_POST) {
        break;
      }
    }

    // deduplicate (preserve order)
    return Array.from(new Set(tags));
  } catch {
    // fail-soft: hashtag parsing must NEVER break post creation
    return [];
  }
}
