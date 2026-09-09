import type { MetadataRoute } from "next";
import {
  courseLessons,
  creators,
  publishedCourses,
  publishedGlossary,
  publishedPaths,
} from "@/lib/content/queries";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ilmxona.uz";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/courses",
    "/learning-paths",
    "/glossary",
    "/contributors",
  ].map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const [courses, paths, glossary, people] = await Promise.all([
    publishedCourses(),
    publishedPaths(),
    publishedGlossary(),
    creators(),
  ]);

  const courseRoutes = (
    await Promise.all(
      courses.map(async (course) => [
        {
          url: `${BASE}/courses/${course.slug}`,
          changeFrequency: "weekly" as const,
          priority: 0.9,
        },
        ...(await courseLessons(course.id)).map((lesson) => ({
          url: `${BASE}/courses/${course.slug}/lessons/${lesson.slug}`,
          lastModified: lesson.updated_at,
          changeFrequency: "monthly" as const,
          priority: 0.7,
        })),
      ]),
    )
  ).flat();

  return [
    ...staticRoutes,
    ...courseRoutes,
    ...paths.map((p) => ({
      url: `${BASE}/learning-paths/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...glossary.map((t) => ({
      url: `${BASE}/glossary/${t.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...people.map((c) => ({
      url: `${BASE}/u/${c.username}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
