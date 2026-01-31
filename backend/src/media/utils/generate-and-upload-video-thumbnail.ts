// backend/src/media/utils/generate-and-upload-video-thumbnail.ts

import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

import {
  generateVideoThumbnail,
  cleanupTempFile,
} from './video-thumbnail.generator';
import { R2Service } from '../../r2/r2.service';

export type GenerateAndUploadVideoThumbnailParams = {
  sourceObjectKey: string;
  ownerUserId: string;
};

export type GenerateAndUploadVideoThumbnailResult = {
  thumbnailObjectKey: string;
};

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
    // ===============================
    // 1️⃣ Download source video
    // ===============================
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

    // ===============================
    // 2️⃣ Generate thumbnail (FFmpeg)
    // ===============================
    const thumb = await generateVideoThumbnail({
      inputVideoPath: localVideoPath,
      width: 1200,
      height: 630,
      seekSeconds: 1,
    });

    localThumbPath = thumb.thumbnailPath;

    // ===============================
    // 3️⃣ Read thumbnail → Buffer
    // ===============================
    const buffer = await fs.readFile(localThumbPath);

    const thumbnailObjectKey = [
      'thumbnails',
      'video',
      ownerUserId,
      `${path.parse(sourceObjectKey).name}.jpg`,
    ].join('/');

    // ===============================
    // 4️⃣ Upload to R2 (CORRECT)
    // ===============================
    await r2Service.uploadObject({
      key: thumbnailObjectKey,
      body: buffer,
      contentType: 'image/jpeg',
    });

    return { thumbnailObjectKey };
  } catch {
    // ❗ Fail-soft: thumbnail optional
    return null;
  } finally {
    // ===============================
    // 5️⃣ Cleanup temp files
    // ===============================
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

