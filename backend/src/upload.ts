import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT, // Cloudflare R2 endpoint
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
) {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || "",
      Key: fileName,
      Body: fileBuffer,
      ContentType: mimeType,
    });

    await s3.send(command);

    console.log(`Uploaded ${fileName} to R2 bucket ${process.env.R2_BUCKET_NAME}`);
  } catch (err) {
    console.error("Upload to R2 failed:", err);
  }
}
