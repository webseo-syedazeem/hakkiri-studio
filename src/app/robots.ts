import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const domain = process.env.NEXT_PUBLIC_APP_URL || "https://hakkiri.studio";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/present", "/privacy", "/terms"],
        disallow: [
          "/api/",
          "/dashboard",
          "/interviews/",
          "/interview-examples/",
          "/presentations/",
          "/practice",
          "/rehearse/",
          "/mock/",
          "/qa/",
          "/mic-check",
          "/login",
          "/signup",
          "/settings",
          "/welcome/",
          "/story-bank",
        ],
      },
    ],
    sitemap: `${domain}/sitemap.xml`,
  };
}
