import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: "https://controllattice.com/sitemap.xml", host: "https://controllattice.com" };
}
