// backend/src/media/media.service.ts
import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { PresignService } from './presign/presign.service';
import { PresignValidateDto } from './dto/presign-validate.dto';
import { MediaUploadPolicy } from './policy/media-upload.policy';
import { randomUUID } from 'crypto';
import { MediaRepository } from './media.repository';
import { R2Service } from '../r2/r2.service';
import { MediaType } from '@prisma/client';
import { MediaMetadataDto } from './dto/media-metadata.dto';
import { MediaMetadataMapper } from './mappers/media-metadata.mapper';
import { AuditLogService } from '../users/audit/audit-log.service';
import { generateAndUploadVideoThumbnail } from './utils/generate-and-upload-video-thumbnail';

import {
  MyMediaGalleryQueryDto,
  MyMediaTypeFilter,
} from './dto/my-media-gallery.query.dto';
import { MyMediaGalleryResponseDto } from './dto/my-media-gallery.response.dto';
import { MyMediaGalleryMapper } from './mappers/my-media-gallery.mapper'; 
import { PostsVisibilityService } from '../posts/visibility/posts-visibility.service';

@Injectable()
export class MediaService {
  constructor(
    private readonly presign: PresignService,
    private readonly mediaRepository: MediaRepository,
    private readonly r2Service: R2Service,
    private readonly auditLogService: AuditLogService,
    private readonly postsVisibilityService: PostsVisibilityService,
  ) {}

  async validateAndPresign(params: {
    actorUserId: string;
    dto: PresignValidateDto;
  }) {
    const { actorUserId, dto } = params;

    MediaUploadPolicy.assertCanUpload({
      actorUserId,
      fileSize: dto.fileSize,
      mimeType: dto.mimeType,
      mediaType: dto.mediaType,
    });

    const objectKey = [
      'uploads',
      dto.mediaType,
      actorUserId,
      `${randomUUID()}-${dto.fileName}`,
    ].join('/');

    const uploadUrl = await this.presign.createUploadUrl({
      bucket: process.env.R2_BUCKET_NAME!,
      key: objectKey,
      contentType: dto.mimeType,
      expiresInSeconds: 60 * 5, // 5 minutes
    });

    // ===============================
// ✅ AUDIT: REQUEST PRESIGN UPLOAD
// ===============================
try {
  await this.auditLogService.log({
    userId: actorUserId,
    action: 'MEDIA_REQUEST_UPLOAD_URL',
    success: true,
    metadata: {
      mediaType: dto.mediaType,
      mimeType: dto.mimeType,
      fileSize: dto.fileSize,
    },
  });
} catch {
  // must not affect upload flow
}


    return {
      uploadUrl,
      objectKey,
      expiresIn: 300,
    };
  }

async completeUpload(params: {
  actorUserId: string;
  objectKey: string;
  mediaType: 'image' | 'video';
  mimeType: string;
}) {
  const { actorUserId, objectKey, mediaType, mimeType } = params;

  // =========================
  // 1️⃣ Duplicate / replay guard
  // =========================
  const exists =
    await this.mediaRepository.existsByObjectKey(objectKey);

  if (exists) {
    throw new BadRequestException(
      'Media already registered',
    );
  }

  // =========================
  // 2️⃣ Validate objectKey belongs to our bucket
  // (fail-fast security check)
  // =========================
  this.r2Service.buildPublicUrl(objectKey);

  // =========================
  // 3️⃣ Persist media metadata (authoritative)
  // =========================
  const media = await this.mediaRepository.create({
    ownerUserId: actorUserId,
    objectKey,
    mediaType:
      mediaType === 'image'
        ? MediaType.IMAGE
        : MediaType.VIDEO,
    mimeType,
  });

// =========================
// 4️⃣ OPTIONAL: Video thumbnail (FAIL-SOFT)
// =========================
if (mediaType === 'video') {
  (async () => {
    try {
      const result =
        await generateAndUploadVideoThumbnail(
          {
            sourceObjectKey: objectKey,
            ownerUserId: actorUserId,
          },
          {
            r2Service: this.r2Service,
          },
        );

      if (result) {
        await this.mediaRepository.update(media.id, {
          thumbnailObjectKey: result.thumbnailObjectKey,
        });
      }
    } catch {
      // ❗ Must never affect upload success
      try {
        await this.auditLogService.log({
          userId: actorUserId,
          action: 'MEDIA_THUMBNAIL_GENERATION_FAILED',
          success: false,
          targetId: media.id,
        });
      } catch {}
    }
  })();
}
  // =========================
  // 5️⃣ AUDIT: MEDIA UPLOAD COMPLETE
  // =========================
  try {
    await this.auditLogService.log({
      userId: actorUserId,
      action: 'MEDIA_UPLOAD_COMPLETE',
      success: true,
      targetId: media.id,
      metadata: {
        mediaType,
        mimeType,
      },
    });
  } catch {
    // must not affect main flow
  }

  // =========================
  // 6️⃣ Response (unchanged)
  // =========================
  return {
    mediaId: media.id,
  };
}

async getMediaMetadata(params: {
  mediaId: string;
  viewerUserId: string | null;
}): Promise<MediaMetadataDto | null> {
  const { mediaId, viewerUserId } = params;

  const row = await this.mediaRepository.findMediaById(mediaId);

  if (!row) {
    return null;
  }

  /**
   * =====================================================
   * 🔎 Resolve related post (if any)
   * =====================================================
   */
  const relatedPost = row.posts?.[0]?.post ?? null;

  /**
   * =====================================================
   * 🔐 Enforce post visibility (BACKEND AUTHORITY)
   * =====================================================
   */
  if (relatedPost) {
    const decision =
      await this.postsVisibilityService.validateVisibility({
        postId: relatedPost.id,
        viewerUserId,
      });

    if (!decision.canView) {
      /**
       * ❗ Viewer cannot see this post
       * - media viewer still allowed
       * - but MUST strip post context
       */
      row.posts = [];
    }
  }

  /**
   * =====================================================
   * 🧭 Mapping (media + optional post context)
   * =====================================================
   */
  return MediaMetadataMapper.toDto(row, viewerUserId);
}


   async getMyMediaGallery(params: {
    actorUserId: string;
    query: MyMediaGalleryQueryDto;
  }): Promise<MyMediaGalleryResponseDto> {
    const { actorUserId, query } = params;

    const mediaType =
      query.type === MyMediaTypeFilter.ALL
        ? undefined
        : query.type === MyMediaTypeFilter.IMAGE
        ? MediaType.IMAGE
        : MediaType.VIDEO;

    const cursor = query.cursor
      ? JSON.parse(
          Buffer.from(query.cursor, 'base64').toString(),
        )
      : undefined;

    const rows = await this.mediaRepository.findOwnerMediaPaginated({
      ownerUserId: actorUserId,
      mediaType,
      usedOnly: query.usedOnly === true,
      cursor,
      limit: query.limit,
    });

    const hasNext = rows.length > query.limit;
    const items = rows.slice(0, query.limit).map(MyMediaGalleryMapper.toItem);

    const nextCursor = hasNext
      ? Buffer.from(
          JSON.stringify({
            createdAt: rows[query.limit].createdAt,
            id: rows[query.limit].id,
          }),
        ).toString('base64')
      : null;

    return {
      items,
      nextCursor,
    };
  } 
}
