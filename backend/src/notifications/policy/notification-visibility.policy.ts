// backend/src/notifications/policy/notification-visibility.policy.ts
import {
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';

export class NotificationVisibilityPolicy {
  /**
   * Viewer must be authenticated
   * (session already validated by guard)
   */
  static assertCanView(viewerUserId: string) {
    if (!viewerUserId) {
      throw new UnauthorizedException();
    }
  }

  /**
   * Owner-only access
   */
  static assertOwner(params: {
    notificationUserId: string;
    viewerUserId: string;
  }) {
    const { notificationUserId, viewerUserId } = params;

    if (notificationUserId !== viewerUserId) {
      throw new ForbiddenException();
    }
  }
}
