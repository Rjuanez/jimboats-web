import type { MetadataRoute } from "next";
import { productionSeoEnabled } from "@/interface/next/config/seoIndexing";
export default function robots(): MetadataRoute.Robots {
  if (!productionSeoEnabled()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: "https://jimboatscharter.com/sitemap.xml",
  };
}
