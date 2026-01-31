// backend/src/media/utils/video-thumbnail.generator.ts

import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

/**
 * =========================================
 * Video Thumbnail Generator (FFmpeg)
 * =========================================
 *
 * - Production safe (no external deps)
 * - No shell injection (spawn args array)
 * - Temp file isolation
 * - Deterministic output
 * - Fail-soft (throw sanitized error only)
 *
 * ⚠️ Lifecycle note:
 * - This function DOES NOT delete temp files
 * - Caller MUST cleanup thumbnailPath
 *
 * Runtime requirements:
 * - ffmpeg must be installed in runtime
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

  // -----------------------------
  // Run FFmpeg (spawn)
  // -----------------------------
  try {
    await runFfmpeg({
      inputVideoPath,
      outputFile,
      width,
      height,
      seekSeconds: safeSeek,
      timeoutMs,
    });

    await assertFileExists(outputFile);

    return {
      thumbnailPath: outputFile,
      mimeType: 'image/jpeg',
    };
  } catch {
    // ❗ sanitize internal error details
    throw new Error('Failed to generate video thumbnail');
  }
}

/**
 * =========================================
 * Helpers
 * =========================================
 */

async function runFfmpeg(params: {
  inputVideoPath: string;
  outputFile: string;
  width: number;
  height: number;
  seekSeconds: number;
  timeoutMs: number;
}): Promise<void> {
  const {
    inputVideoPath,
    outputFile,
    width,
    height,
    seekSeconds,
    timeoutMs,
  } = params;

  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(
      'ffmpeg',
      [
        '-ss',
        String(seekSeconds),
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
        stdio: 'ignore', // 🔒 no log spam
      },
    );

    const timer = setTimeout(() => {
      ffmpeg.kill('SIGKILL');
      reject(new Error('ffmpeg timeout'));
    }, timeoutMs);

    ffmpeg.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });

    ffmpeg.on('exit', (code) => {
      clearTimeout(timer);
      code === 0
        ? resolve()
        : reject(new Error('ffmpeg failed'));
    });
  });
}

async function assertFileExists(filePath: string) {
  try {
    await fs.access(filePath);
  } catch {
    throw new Error('Required file does not exist');
  }
}

async function assertFfmpegAvailable() {
  try {
    await new Promise<void>((resolve, reject) => {
      const p = spawn('ffmpeg', ['-version'], {
        stdio: 'ignore',
      });
      p.on('exit', (code) =>
        code === 0 ? resolve() : reject(),
      );
      p.on('error', reject);
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
