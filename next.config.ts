import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bound the CDN stale window as well as the commercial routes' ISR interval.
  expireTime: 3600,
  turbopack: { root: process.cwd() },
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  async redirects() {
    // Keep booking operations, coupons and communications; retire web content editors.
    const retiredEditors = [
      "experiences",
      "extras",
      "media",
      "content",
      "localization",
      "settings",
      "cancellation-policies",
    ].map((section) => ({
      source: `/admin/${section}/:path*`,
      destination: "/admin/bookings",
      permanent: false,
    }));
    return [
      ...retiredEditors,
      ...["", "/book", "/book/success", "/bookings/:reference"].map((path) => ({
        source: `/ca${path}`,
        destination: `/es${path}`,
        permanent: true,
      })),
      ...[
        ["es", "experiencias"],
        ["en", "experiences"],
        ["fr", "experiences"],
        ["de", "erlebnisse"],
        ["nl", "ervaringen"],
      ].map(([locale, slug]) => ({
        source: `/${locale}/${slug}`,
        destination: `/${locale}#experiences`,
        permanent: true,
      })),
    ];
  },
  output: "standalone",
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-pg",
    "pg",
    "sharp",
  ],
};

export default nextConfig;
