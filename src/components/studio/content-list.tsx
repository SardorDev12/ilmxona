"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  submitForReview,
  type ContentFormState,
} from "@/lib/content/mutations";
import { STATUS_LABELS, type ContentStatus } from "@/lib/content/types";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type CourseGroup = {
  id: string;
  slug: string;
  title: string;
  status: ContentStatus;
  reviewNote: string | null;
  lessons: {
    id: string;
    slug: string;
    title: string;
    status: ContentStatus;
    reviewNote: string | null;
  }[];
};

/**
 * The author's courses, each with its lessons underneath. There is one
 * submit button per course and none per lesson: a lesson is reviewed as
 * part of the course it belongs to.
 */
export function ContentList({ courses }: { courses: CourseGroup[] }) {
  const [state, action] = useActionState<ContentFormState, FormData>(
    submitForReview,
    {},
  );

  return (
    <div className="flex flex-col gap-4">
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.ok && <p className="text-sm text-accent">{state.ok}</p>}

      {courses.map((course) => {
        const unsent = course.lessons.filter(
          (l) => l.status === "DRAFT" || l.status === "CHANGES_REQUESTED",
        ).length;
        const courseUnsent =
          course.status === "DRAFT" || course.status === "CHANGES_REQUESTED";
        const canSubmit = courseUnsent || unsent > 0;

        return (
          <Card key={course.id}>
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/courses/${course.slug}`}
                      className="font-medium hover:text-primary"
                    >
                      {course.title}
                    </Link>
                    <Badge
                      variant={
                        course.status === "PUBLISHED" ? "primary" : "outline"
                      }
                    >
                      {STATUS_LABELS[course.status]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {course.lessons.length} ta dars
                    {unsent > 0 && ` · ${unsent} tasi yuborilmagan`}
                  </p>
                  {course.reviewNote && (
                    <p className="mt-1 max-w-lg text-xs text-destructive">
                      Moderator izohi: {course.reviewNote}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <ButtonLink
                    href={`/contributor/lessons/new?course=${course.slug}`}
                    size="sm"
                    variant="outline"
                  >
                    Dars qo&apos;shish
                  </ButtonLink>

                  {canSubmit && (
                    <form action={action}>
                      <input
                        type="hidden"
                        name="course_id"
                        value={course.id}
                      />
                      <SubmitButton
                        label={
                          course.status === "PUBLISHED"
                            ? "Yangilanishni yuborish"
                            : "Ko'rib chiqishga yuborish"
                        }
                      />
                    </form>
                  )}
                </div>
              </div>

              {course.lessons.length > 0 && (
                <ul className="divide-y divide-border border-t border-border">
                  {course.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-2"
                    >
                      <div className="min-w-0">
                        <Link
                          href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                          className="text-sm hover:text-primary"
                        >
                          {lesson.title}
                        </Link>
                        {lesson.reviewNote && (
                          <p className="max-w-lg text-xs text-destructive">
                            Izoh: {lesson.reviewNote}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={
                          lesson.status === "PUBLISHED" ? "primary" : "outline"
                        }
                      >
                        {STATUS_LABELS[lesson.status]}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Yuborilmoqda…" : label}
    </Button>
  );
}
