import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/observable-machine", "/products", "/work", "/ai", "/about", "/staff", "/contact"];
  return paths.map((path) => ({
    url: `https://controllattice.com${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/observable-machine" ? 0.9 : 0.7,
  }));
}
