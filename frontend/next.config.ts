import type { NextConfig } from "next";

/**
 * Next.js Configuration
 * - turbopack.root: ป้องกัน warning เรื่อง workspace root
 * - reactCompiler: เปิดใช้งาน React Compiler (optional)
 * - rewrites: proxy /api/* → backend (NestJS) ที่ port 3000
 */

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  reactCompiler: true,

  // เพิ่ม proxy ไป backend NestJS
  async rewrites() {
    return [
      {
        source: "/api/:path*", // ถ้า frontend เรียก /api/*
        destination: "http://localhost:4000/api/:path*", // จะ proxy ไปยัง NestJS backend
      },
    ];
  },
};

export default nextConfig;
