// backend/src/media/utils/generate-and-upload-video-thumbnail.ts

import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

import { generateVideoThumbnail, cleanupTempFile } from './video-thumbnail.generator';
import { R2Service } from '../../r2/r2.service';

/**
 * =========================================
 * Generate & Upload Video Thumbnail
 * =========================================
 *
 * Responsibility:
 * - Download video from R2
 * - Generate thumbnail via FFmpeg
 * - Upload thumbnail to R2
 * - Return thumbnail objectKey
 *
 * Design principles:
 * - Fail-soft (never throw to caller)
 * - No DB access (pure infra orchestration)
 * - No auth / policy logic
 * - Deterministic objectKey
 *
 * Caller responsibilities:
 * - Persist thumbnailObjectKey to DB
 * - Audit / logging
 */
export type GenerateAndUploadVideoThumbnailParams = {
  /**
   * Source video objectKey (R2)
   * e.g. uploads/video/{userId}/{uuid}.mp4
   */
  sourceObjectKey: string;

  /**
   * Owner user (used for objectKey namespace)
   */
  ownerUserId: string;
};

export type GenerateAndUploadVideoThumbnailResult = {
  /**
   * objectKey of uploaded thumbnail
   * e.g. thumbnails/video/{userId}/{uuid}.jpg
   */
  thumbnailObjectKey: string;
};

/**
 * =========================================
 * MAIN FUNCTION
 * =========================================
 */
export async function generateAndUploadVideoThumbnail(
  params: GenerateAndUploadVideoThumbnailParams,
  deps: {
    r2Service: R2Service;
  },
): Promise<GenerateAndUploadVideoThumbnailResult | null> {
  const { sourceObjectKey, ownerUserId } = params;
  const { r2Service } = deps;

  let localVideoPath: string | null = null;
  let localThumbPath: string | null = null;

  try {
    /**
     * ===============================
     * 1️⃣ Download source video to temp
     * ===============================
     */
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), 'phlyphant-video-src-'),
    );

    localVideoPath = path.join(
      tmpDir,
      path.basename(sourceObjectKey),
    );

    await r2Service.downloadObject({
      objectKey: sourceObjectKey,
      destinationPath: localVideoPath,
    });

    /**
     * ===============================
     * 2️⃣ Generate thumbnail (FFmpeg)
     * ===============================
     */
    const thumbResult = await generateVideoThumbnail({
      inputVideoPath: localVideoPath,
      width: 1200,
      height: 630,
      seekSeconds: 1,
    });

    localThumbPath = thumbResult.thumbnailPath;

    /**
     * ===============================
     * 3️⃣ Upload thumbnail to R2
     * ===============================
     */
    const thumbnailObjectKey = [
      'thumbnails',
      'video',
      ownerUserId,
      `${path.parse(sourceObjectKey).name}.jpg`,
    ].join('/');

    await r2Service.uploadObject({
      objectKey: thumbnailObjectKey,
      filePath: localThumbPath,
      contentType: 'image/jpeg',
      cacheControl: 'public, max-age=31536000, immutable',
    });

    /**
     * ===============================
     * 4️⃣ Success
     * ===============================
     */
    return { thumbnailObjectKey };
  } catch {
    /**
     * ❗ FAIL-SOFT GUARANTEE
     * - Thumbnail is optional
     * - Never break upload flow
     */
    return null;
  } finally {
    /**
     * ===============================
     * 5️⃣ Cleanup temp files (best-effort)
     * ===============================
     */
    if (localThumbPath) {
      await cleanupTempFile(localThumbPath);
    }

    if (localVideoPath) {
      try {
        await fs.unlink(localVideoPath);
      } catch {
        // ignore
      }
    }
  }
}
