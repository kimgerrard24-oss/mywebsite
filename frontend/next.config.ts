// file: frontend/next.config.js
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "standalone",

  experimental: {
    useLightningcss: false,
    optimizeCss: false,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
    ],
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

  automaticVercelMonitors: false,

  disableLogger: true,
});
