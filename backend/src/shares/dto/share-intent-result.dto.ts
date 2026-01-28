// backend/src/shares/dto/share-intent-result.dto.ts

export type ShareIntentReason =
  | 'OK'
  | 'NOT_FOUND'
  | 'POST_DELETED'
  | 'POST_HIDDEN'
  | 'BLOCKED'
  | 'VISIBILITY_DENIED'
  | 'ACCOUNT_PRIVATE';

export class ShareIntentResultDto {
  canShareInternal!: boolean;
  canShareExternal!: boolean;
  reason!: ShareIntentReason;

  /**
   * Optional UX hints (not authority)
   */
  requireFollow?: boolean;
}
