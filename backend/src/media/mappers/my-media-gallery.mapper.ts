// backend/src/media/mappers/my-media-gallery.mapper.ts
import { MyMediaGalleryItemDto } from '../dto/my-media-gallery.response.dto';
import { Media, MediaType } from '@prisma/client';
import { buildCdnUrl } from '../utils/build-cdn-url.util';

export class MyMediaGalleryMapper {
  static toItem(
    row: Media & { posts: any[] },
  ): MyMediaGalleryItemDto {
    const post = row.posts[0]?.post ?? null;

    if (
      row.mediaType !== MediaType.IMAGE &&
      row.mediaType !== MediaType.VIDEO
    ) {
      throw new Error(
        `Unsupported media type in gallery: ${row.mediaType}`,
      );
    }

    return {
      mediaId: row.id,
      postId: post?.id ?? null,
      type: row.mediaType,

      url: buildCdnUrl(row.objectKey),

      thumbnailUrl:
        row.mediaType === MediaType.VIDEO &&
        row.thumbnailObjectKey
          ? buildCdnUrl(row.thumbnailObjectKey)
          : null,

      width: row.width,
      height: row.height,
      duration: row.duration,
      createdAt: post?.createdAt ?? row.createdAt,
    };
  }
}
