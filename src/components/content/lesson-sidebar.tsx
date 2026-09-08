import Link from "next/link";
import type { Course } from "@/content/types";
import { lessonCount } from "@/content";
import { cn } from "@/lib/utils";

type Props = {
  course: Course;
  currentSlug: string;
};

/**
 * Full course curriculum shown alongside a lesson, so the reader always
 * sees where they are and can jump anywhere without going back to the
 * course page. Sticky on desktop, collapsed into a <details> on mobile.
 */
export function LessonSidebar({ course, currentSlug }: Props) {
  const total = lessonCount(course);

  return (
    <>
      <aside className="hidden lg:block">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-6">
          <SidebarInner course={course} currentSlug={currentSlug} />
        </div>
      </aside>

      <details className="mb-6 rounded-lg border border-border lg:hidden">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
          Kurs dasturi
          <span className="ml-2 font-normal text-muted-foreground">
            ({total} ta dars)
          </span>
        </summary>
        <div className="border-t border-border px-4 py-3">
          <SidebarInner course={course} currentSlug={currentSlug} />
        </div>
      </details>
    </>
  );
}

function SidebarInner({ course, currentSlug }: Props) {
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

      {course.modules.map((module, moduleIndex) => {
        // Lessons are numbered continuously across modules.
        const offset = course.modules
          .slice(0, moduleIndex)
          .reduce((n, m) => n + m.lessons.length, 0);

        return (
          <div key={module.title} className="flex flex-col gap-1.5">
            <h2 className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {moduleIndex + 1}. {module.title}
            </h2>

            <ul className="flex flex-col">
              {module.lessons.map((lesson, lessonIndex) => {
                const number = offset + lessonIndex + 1;
                const isCurrent = lesson.slug === currentSlug;

                return (
                  <li key={lesson.slug}>
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
                        {number}.
                      </span>
                      <span>{lesson.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
