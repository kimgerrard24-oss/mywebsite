import { PostUserTagStatus } from '@prisma/client';

type UpdateAction = 'ACCEPT' | 'REJECT' | 'REMOVE';

export class PostUserTagUpdatePolicy {
  static decide(params: {
    actorUserId: string;
    postAuthorId: string;
    taggedUserId: string;
    currentStatus: PostUserTagStatus;
    isBlockedEitherWay: boolean;
  }): {
    allowed: boolean;
    allowedActions: UpdateAction[];
    nextStatus?: PostUserTagStatus;
    reason?: string;
  } {
    const {
      actorUserId,
      postAuthorId,
      taggedUserId,
      currentStatus,
      isBlockedEitherWay,
    } = params;

    if (isBlockedEitherWay) {
      return {
        allowed: false,
        allowedActions: [],
        reason: 'BLOCKED',
      };
    }

    const isTaggedUser = actorUserId === taggedUserId;
    const isPostOwner = actorUserId === postAuthorId;

    const allowedActions: UpdateAction[] = [];

    // =========================
    // Tagged user actions
    // =========================
    if (isTaggedUser) {
      if (currentStatus === 'PENDING') {
        allowedActions.push('ACCEPT', 'REJECT');
      }

      if (currentStatus === 'ACCEPTED') {
        allowedActions.push('REMOVE');
      }
    }

    // =========================
    // Post owner actions
    // =========================
    if (isPostOwner) {
      if (
        currentStatus === 'PENDING' ||
        currentStatus === 'ACCEPTED'
      ) {
        allowedActions.push('REMOVE');
      }
    }

    if (allowedActions.length === 0) {
      return {
        allowed: false,
        allowedActions: [],
        reason: 'NO_PERMISSION',
      };
    }

    return {
      allowed: true,
      allowedActions,
    };
  }

  static resolveNextStatus(action: UpdateAction): PostUserTagStatus {
    switch (action) {
      case 'ACCEPT':
        return 'ACCEPTED';
      case 'REJECT':
        return 'REJECTED';
      case 'REMOVE':
        return 'REMOVED';
      default:
        return 'PENDING';
    }
  }
}
