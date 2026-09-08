import Link from "next/link";
import type { Course, GlossaryTerm, LearningPath } from "@/content/types";
import { lessonCount } from "@/content";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-md">
        <div
          className={`flex h-24 items-end bg-gradient-to-br ${course.accent} p-4`}
        >
          <span className="text-lg font-bold text-white drop-shadow-sm">
            {course.title}
          </span>
        </div>
        <CardContent className="flex flex-col gap-3 p-4">
          <p className="text-sm text-muted-foreground">{course.subtitle}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">{course.difficulty}</Badge>
            <span>{lessonCount(course)} ta dars</span>
            <span aria-hidden>·</span>
            <span>{course.durationHours} soat</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function PathCard({ path }: { path: LearningPath }) {
  return (
    <Link
      href={`/learning-paths/${path.slug}`}
      className="group rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardContent className="flex flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold">{path.title}</h3>
            <Badge variant="outline">{path.difficulty}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{path.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {path.skills.map((skill) => (
              <Badge key={skill}>{skill}</Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {path.courseSlugs.length} ta kurs · ~{path.durationMonths} oy
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function TermCard({ term }: { term: GlossaryTerm }) {
  return (
    <Link
      href={`/glossary/${term.slug}`}
      className="group rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardContent className="flex flex-col gap-1.5 p-4">
          <div className="flex items-baseline gap-2">
            <h3 className="font-semibold">{term.term}</h3>
            <span className="text-xs text-muted-foreground">{term.en}</span>
          </div>
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {term.definition}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground"
    >
      {initials}
    </span>
  );
}
