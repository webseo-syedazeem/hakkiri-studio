import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // src/proxy.ts sees every API request, so Next buffers request bodies up to this size.
    // It must fit the largest recording: 25 MB for an answer, 50 MB for a presentation run.
    proxyClientMaxBodySize: "60mb",
  },
  // Microphone access is needed on the live practice screens.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Permissions-Policy", value: "microphone=(self), camera=(self)" },
          // No other site may frame Hakkiri (stops "click here" tricks on Delete all my data).
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
