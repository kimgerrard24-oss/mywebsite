import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
) {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: fileName,
      Body: fileBuffer,
      ContentType: mimeType,
    });

    await s3.send(command);

    console.log(`✅ Uploaded ${fileName} to ${process.env.AWS_S3_BUCKET}`);
  } catch (err) {
    console.error("❌ Upload failed:", err);
  }
}
