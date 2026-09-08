import type { MetadataRoute } from "next";
import { courses, courseLessons } from "@/content";
import { learningPaths } from "@/content/paths";
import { glossary } from "@/content/glossary";
import { contributors } from "@/content/contributors";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ilmxona.uz";

export default function sitemap(): MetadataRoute.Sitemap {
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

  const courseRoutes = courses.flatMap((course) => [
    {
      url: `${BASE}/courses/${course.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    ...courseLessons(course).map((lesson) => ({
      url: `${BASE}/courses/${course.slug}/lessons/${lesson.slug}`,
      lastModified: lesson.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ]);

  return [
    ...staticRoutes,
    ...courseRoutes,
    ...learningPaths.map((p) => ({
      url: `${BASE}/learning-paths/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...glossary.map((t) => ({
      url: `${BASE}/glossary/${t.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...contributors.map((c) => ({
      url: `${BASE}/u/${c.username}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
