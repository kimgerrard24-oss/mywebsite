import fs from "fs";
import path from "path";
import { uploadFile } from "./upload";

async function main() {
  const filePath = path.resolve("test.jpg"); // ใช้ไฟล์รูปในโปรเจ็กต์
  const fileBuffer = fs.readFileSync(filePath);

  await uploadFile(fileBuffer, "test-upload.jpg", "image/jpeg");
}

main().catch((err) => {
  console.error("❌ Upload failed:", err);
});
