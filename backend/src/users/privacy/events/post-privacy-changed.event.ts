// backens/src/users/privacy/events/post-privacy-changed.event.ts

import { Injectable } from '@nestjs/common';

@Injectable()
export class PostPrivacyChangedEvent {
  emit(params: { userId: string; isPrivate: boolean }) {
    // currently noop — reserved for realtime / analytics
  }
}

