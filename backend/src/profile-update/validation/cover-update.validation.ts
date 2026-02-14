// backend/src/profile-update/validation/cover-update.validation.ts

export function validateCoverContent(content?: string) {
  if (!content) return;

  if (content.length > 1000) {
    throw new Error('CONTENT_TOO_LONG');
  }
}
