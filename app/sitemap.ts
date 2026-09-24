import type { MetadataRoute } from "next";
import { listPosts, machineDate } from "@/lib/blog";
import { indexedPages, site } from "@/lib/site";

/** Le sitemap suit les publications : il se régénère comme les pages du journal. */
export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const pages: MetadataRoute.Sitemap = indexedPages.map((item) => ({
    url: new URL(item.href, site.url).toString(),
    lastModified,
    changeFrequency: item.href === "/" ? "monthly" : "yearly",
    priority: item.href === "/" ? 1 : 0.8,
  }));

  // Chaque article publié, daté de sa publication : c'est cette date que les
  // moteurs regardent pour décider s'il vaut la peine de repasser.
  const posts: MetadataRoute.Sitemap = (await listPosts()).map((post) => ({
    url: new URL(`/journal/${post.slug}`, site.url).toString(),
    lastModified: new Date(machineDate(post)),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...pages, ...posts];
}
