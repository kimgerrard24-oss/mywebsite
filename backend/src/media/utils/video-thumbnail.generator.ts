// backend/src/media/utils/video-thumbnail.generator.ts

import execa from 'execa';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';


/**
 * =========================================
 * Video Thumbnail Generator (FFmpeg)
 * =========================================
 *
 * - Production safe
 * - No shell injection (execa args array)
 * - Temp file isolation
 * - Deterministic output
 * - Fail-soft (caller decides retry / fallback)
 *
 * ⚠️ Lifecycle note:
 * - This function DOES NOT delete temp files
 * - Caller MUST cleanup thumbnailPath when done
 *
 * Runtime requirements:
 * - ffmpeg must be installed in runtime (Docker / host)
 */
export type GenerateVideoThumbnailOptions = {
  /**
   * Absolute path to input video file
   */
  inputVideoPath: string;

  /**
   * Target width (OG recommended: 1200)
   */
  width?: number;

  /**
   * Target height (OG recommended: 630)
   */
  height?: number;

  /**
   * Seek time in seconds (default: 1s)
   * Will be clamped to >= 0
   */
  seekSeconds?: number;

  /**
   * Max execution time (ms)
   * Prevent ffmpeg hang
   *
   * Default: 15s
   */
  timeoutMs?: number;
};

export type GenerateVideoThumbnailResult = {
  /**
   * Absolute path to generated thumbnail image
   *
   * ⚠️ Caller owns cleanup
   */
  thumbnailPath: string;

  /**
   * Mime type (always image/jpeg)
   */
  mimeType: 'image/jpeg';
};

/**
 * =========================================
 * MAIN FUNCTION
 * =========================================
 */
export async function generateVideoThumbnail(
  options: GenerateVideoThumbnailOptions,
): Promise<GenerateVideoThumbnailResult> {
  const {
    inputVideoPath,
    width = 1200,
    height = 630,
    seekSeconds = 1,
    timeoutMs = 15_000,
  } = options;

  // -----------------------------
  // Safety checks
  // -----------------------------
  if (!path.isAbsolute(inputVideoPath)) {
    throw new Error('inputVideoPath must be absolute');
  }

  await assertFileExists(inputVideoPath);
  await assertFfmpegAvailable();

  const safeSeek = Math.max(0, seekSeconds);

  // -----------------------------
  // Prepare temp directory
  // -----------------------------
  const tmpDir = await fs.mkdtemp(
    path.join(os.tmpdir(), 'phlyphant-video-thumb-'),
  );

  const outputFile = path.join(
    tmpDir,
    `${randomUUID()}.jpg`,
  );

  try {
    /**
     * FFmpeg command explanation:
     *
     * -ss           : seek to timestamp (fast seek)
     * -i            : input file
     * -frames:v 1   : extract 1 frame
     * -vf           : scale + pad to exact OG size
     * -q:v 2        : high quality JPEG
     * -y            : overwrite output
     */
    await execa(
      'ffmpeg',
      [
        '-ss',
        String(safeSeek),
        '-i',
        inputVideoPath,
        '-frames:v',
        '1',
        '-vf',
        `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`,
        '-q:v',
        '2',
        '-y',
        outputFile,
      ],
      {
        stdio: 'ignore', // 🔒 prevent log spam / info leak
        timeout: timeoutMs,
      },
    );

    await assertFileExists(outputFile);

    return {
      thumbnailPath: outputFile,
      mimeType: 'image/jpeg',
    };
  } catch {
    // sanitize all internal details
    throw new Error(
      'Failed to generate video thumbnail',
    );
  }
}

/**
 * =========================================
 * Helpers
 * =========================================
 */

async function assertFileExists(filePath: string) {
  try {
    await fs.access(filePath);
  } catch {
    throw new Error('Required file does not exist');
  }
}

async function assertFfmpegAvailable() {
  try {
    await execa('ffmpeg', ['-version'], {
      stdio: 'ignore',
    });
  } catch {
    throw new Error(
      'ffmpeg is not available in runtime',
    );
  }
}

/**
 * Optional helper for callers
 * (safe to call multiple times)
 */
export async function cleanupTempFile(
  filePath: string,
) {
  try {
    await fs.unlink(filePath);
  } catch {
    // ignore
  }
}
