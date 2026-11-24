import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // pdf.js reads uploaded CVs on the server; it loads its own worker file, so it must not be bundled.
  serverExternalPackages: ["pdfjs-dist"],
  // The CV fonts are read from disk when a file is exported or previewed, so they must travel with those routes.
  outputFileTracingIncludes: {
    "/api/cv/**": ["./src/lib/cv/render/fonts/*.ttf"],
  },
  experimental: {
    // src/proxy.ts sees every API request, so Next buffers request bodies up to this size.
    // It must fit the largest recording: 25 MB for an answer, 50 MB for a presentation run.
    proxyClientMaxBodySize: "60mb",
  },
  // The CV section moved from /apply/cvs to /cv. Old links still work.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.hakkiri.studio",
          },
        ],
        destination: "https://hakkiri.studio/:path*",
        permanent: true,
      },
      { source: "/apply/cvs", destination: "/cv", permanent: false },
      { source: "/apply/cvs/:id", destination: "/cv/v/:id", permanent: false },
    ];
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
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; frame-ancestors 'none'; worker-src 'self' blob:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https:; media-src 'self' blob: data: https:; connect-src 'self' https: wss:; font-src 'self' data: https:;",
          },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
