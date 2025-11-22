import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "standalone",

  experimental: {
    // 🔥 ปิด LightningCSS เพื่อแก้ error lightningcss.linux-x64-gnu.node
    useLightningcss: false,

    // ปิด optimizeCss (ป้องกัน LightningCSS อ้อมๆ)
    optimizeCss: false,

    // บังคับใช้ Webpack build worker (เสถียรที่สุดใน Docker)
    webpackBuildWorker: true,
  },

  async rewrites() {
    if (!isProd) {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:4001/api/:path*",
        },
      ];
    }

    return [];
  },
};

export default withSentryConfig(nextConfig, {
  org: "phlyphant",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
