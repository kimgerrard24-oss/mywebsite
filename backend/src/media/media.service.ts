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

@Injectable()
export class MediaService {
  constructor(
    private readonly presign: PresignService,
    private readonly mediaRepository: MediaRepository,
    private readonly r2Service: R2Service,
    private readonly auditLogService: AuditLogService,

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

  // 1️⃣ ป้องกัน duplicate / replay
  const exists =
    await this.mediaRepository.existsByObjectKey(objectKey);

  if (exists) {
    throw new BadRequestException(
      'Media already registered',
    );
  }

  // 2️⃣ ตรวจสอบว่า key เป็นของ bucket เราจริง (fail-fast)
  // buildPublicUrl จะ throw ถ้า key ผิด
  const _cdnUrl =
    this.r2Service.buildPublicUrl(objectKey);

  // 3️⃣ Persist metadata (draft media)
  const media = await this.mediaRepository.create({
    ownerUserId: actorUserId,
    objectKey,
    mediaType:
      mediaType === 'image'
        ? MediaType.IMAGE
        : MediaType.VIDEO,
    mimeType,
  });
// ===============================
// ✅ AUDIT: MEDIA REGISTERED
// ===============================
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

  // 4️⃣ response
  return {
    mediaId: media.id,
  };
 }

  async getMediaMetadata(params: {
    mediaId: string;
    viewerUserId: string | null;
  }): Promise<MediaMetadataDto | null> {
    const row = await this.mediaRepository.findMediaById(params.mediaId);

    if (!row) {
      return null;
    }

    return MediaMetadataMapper.toDto(row, params.viewerUserId);
  }

}
