import Link from "next/link";
import type { Course, Lesson, Module } from "@/lib/content/types";
import { cn } from "@/lib/utils";

type Props = {
  course: Course;
  modules: Module[];
  lessons: Lesson[];
  currentSlug: string;
};

/**
 * Full course curriculum shown alongside a lesson, so the reader always
 * sees where they are and can jump anywhere without going back to the
 * course page. Sticky on desktop, collapsed into a <details> on mobile.
 */
export function LessonSidebar(props: Props) {
  return (
    <>
      <aside className="hidden lg:block">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-6">
          <SidebarInner {...props} />
        </div>
      </aside>

      <details className="mb-6 rounded-lg border border-border lg:hidden">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
          Kurs dasturi
          <span className="ml-2 font-normal text-muted-foreground">
            ({props.lessons.length} ta dars)
          </span>
        </summary>
        <div className="border-t border-border px-4 py-3">
          <SidebarInner {...props} />
        </div>
      </details>
    </>
  );
}

function SidebarInner({ course, modules, lessons, currentSlug }: Props) {
  // Lessons arrive ordered by position; numbering follows that order and
  // stays continuous across modules.
  const numberOf = new Map(lessons.map((lesson, i) => [lesson.id, i + 1]));

  // A module heading is only worth drawing when it has lessons; lessons
  // with no module at all are listed last under a generic heading.
  const groups: { title: string | null; items: Lesson[] }[] = modules
    .map((module) => ({
      title: module.title,
      items: lessons.filter((l) => l.module_id === module.id),
    }))
    .filter((group) => group.items.length > 0);

  const loose = lessons.filter((l) => l.module_id === null);
  if (loose.length > 0) {
    groups.push({ title: groups.length > 0 ? "Boshqa darslar" : null, items: loose });
  }

  return (
    <nav aria-label="Kurs dasturi" className="flex flex-col gap-5">
      <Link
        href={`/courses/${course.slug}`}
        className="flex flex-col gap-0.5 rounded-md p-2 transition-colors hover:bg-muted"
      >
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          Kurs
        </span>
        <span className="font-semibold leading-tight">{course.title}</span>
      </Link>

      {groups.map((group, groupIndex) => (
        <div key={group.title ?? "loose"} className="flex flex-col gap-1.5">
          {group.title && (
            <h2 className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {groupIndex + 1}. {group.title}
            </h2>
          )}

          <ul className="flex flex-col">
            {group.items.map((lesson) => {
              const isCurrent = lesson.slug === currentSlug;

              return (
                <li key={lesson.id}>
                  <Link
                    href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                    aria-current={isCurrent ? "page" : undefined}
                    className={cn(
                      "flex gap-2 border-l-2 py-1.5 pl-3 pr-2 text-sm transition-colors",
                      isCurrent
                        ? "border-primary bg-primary/5 font-medium text-foreground"
                        : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                    )}
                  >
                    <span className="shrink-0 tabular-nums opacity-60">
                      {numberOf.get(lesson.id)}.
                    </span>
                    <span>{lesson.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
