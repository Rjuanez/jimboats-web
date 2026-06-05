import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  output: "standalone",
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg", "sharp"],
};

export default nextConfig;
