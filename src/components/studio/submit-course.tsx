"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  submitForReview,
  type ContentFormState,
} from "@/lib/content/mutations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * One button for the whole course: the author never submits a lesson by
 * itself, so this is the only place review is started from.
 */
export function SubmitCourse({
  courseId,
  isLive,
  unsent,
  courseUnsent,
}: {
  courseId: string;
  isLive: boolean;
  unsent: number;
  courseUnsent: boolean;
}) {
  const [state, action] = useActionState<ContentFormState, FormData>(
    submitForReview,
    {},
  );

  const nothingToSend = !courseUnsent && unsent === 0;

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h2 className="font-semibold">
            {isLive ? "Yangilanishni yuborish" : "Ko'rib chiqishga yuborish"}
          </h2>
          <p className="mt-1 max-w-lg text-sm text-muted-foreground">
            {nothingToSend
              ? "Hammasi yuborilgan — moderator javobini kuting."
              : isLive
                ? `${unsent} ta yangi dars moderatorga yuboriladi. Kursning o'zi saytda qoladi.`
                : "Kurs va undagi barcha darslar birgalikda ko'rib chiqiladi."}
          </p>
          {state.error && (
            <p className="mt-2 text-sm text-destructive">{state.error}</p>
          )}
          {state.ok && <p className="mt-2 text-sm text-accent">{state.ok}</p>}
        </div>

        <form action={action}>
          <input type="hidden" name="course_id" value={courseId} />
          <SubmitButton disabled={nothingToSend} />
        </form>
      </CardContent>
    </Card>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Yuborilmoqda…" : "Yuborish"}
    </Button>
  );
}
