// backend/src/media/policy/media-upload.policy.ts
export class MediaUploadPolicy {
  static assertCanUpload(params: {
    actorUserId: string;
    fileSize: number;
    mimeType: string;
    mediaType: 'image' | 'video';
  }) {
    const { fileSize, mimeType, mediaType } = params;

    if (!params.actorUserId) {
      throw new Error('Unauthorized upload');
    }

    if (mediaType === 'image') {
      if (!mimeType.startsWith('image/')) {
        throw new Error('Invalid image mime type');
      }

      if (fileSize > 10 * 1024 * 1024) {
        throw new Error('Image size exceeds limit');
      }
    }

    if (mediaType === 'video') {
      if (!mimeType.startsWith('video/')) {
        throw new Error('Invalid video mime type');
      }

      if (fileSize > 50 * 1024 * 1024) {
        throw new Error('Video size exceeds limit');
      }
    }
  }
}
