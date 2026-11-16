"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  deleteLesson,
  moveLesson,
  type ContentFormState,
} from "@/lib/content/mutations";
import { STATUS_LABELS, type ContentStatus } from "@/lib/content/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type LessonRow = {
  id: string;
  slug: string;
  title: string;
  status: ContentStatus;
  moduleTitle: string | null;
  durationMin: number;
  reviewNote: string | null;
  editable: boolean;
};

/** The course's lessons, in order, with the actions an author needs. */
export function LessonRows({
  courseSlug,
  lessons,
}: {
  courseSlug: string;
  lessons: LessonRow[];
}) {
  const [moveState, move] = useActionState<ContentFormState, FormData>(
    moveLesson,
    {},
  );
  const [removeState, remove] = useActionState<ContentFormState, FormData>(
    deleteLesson,
    {},
  );

  const error = moveState.error ?? removeState.error;

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <ul className="divide-y divide-border">
          {lessons.map((lesson, index) => (
            <li
              key={lesson.id}
              className="flex flex-wrap items-center gap-3 px-4 py-3"
            >
              <span className="w-6 shrink-0 text-sm tabular-nums text-muted-foreground">
                {index + 1}.
              </span>

              <div className="min-w-0 flex-1">
                <Link
                  href={
                    lesson.editable
                      ? `/contributor/courses/${courseSlug}/lessons/${lesson.slug}`
                      : `/courses/${courseSlug}/lessons/${lesson.slug}`
                  }
                  className="text-sm font-medium hover:text-primary"
                >
                  {lesson.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {lesson.moduleTitle ?? "Modulsiz"} · {lesson.durationMin} daq
                </p>
                {lesson.reviewNote && (
                  <p className="mt-1 max-w-lg text-xs text-destructive">
                    Moderator izohi: {lesson.reviewNote}
                  </p>
                )}
              </div>

              <Badge
                variant={lesson.status === "PUBLISHED" ? "primary" : "outline"}
              >
                {STATUS_LABELS[lesson.status]}
              </Badge>

              <div className="flex items-center gap-1">
                <form action={move}>
                  <input type="hidden" name="id" value={lesson.id} />
                  <input type="hidden" name="direction" value="up" />
                  <IconButton
                    label="Yuqoriga ko'chirish"
                    disabled={index === 0}
                  >
                    ↑
                  </IconButton>
                </form>
                <form action={move}>
                  <input type="hidden" name="id" value={lesson.id} />
                  <input type="hidden" name="direction" value="down" />
                  <IconButton
                    label="Pastga ko'chirish"
                    disabled={index === lessons.length - 1}
                  >
                    ↓
                  </IconButton>
                </form>

                {lesson.editable && (
                  <form
                    action={remove}
                    onSubmit={(e) => {
                      if (
                        !window.confirm(
                          `"${lesson.title}" darsi o'chirilsinmi? Buni qaytarib bo'lmaydi.`,
                        )
                      ) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="id" value={lesson.id} />
                    <IconButton label="Darsni o'chirish" destructive>
                      ✕
                    </IconButton>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function IconButton({
  label,
  children,
  disabled,
  destructive,
}: {
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
  destructive?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size="sm"
      variant="ghost"
      aria-label={label}
      title={label}
      disabled={disabled || pending}
      className={destructive ? "text-destructive" : undefined}
    >
      {children}
    </Button>
  );
}
