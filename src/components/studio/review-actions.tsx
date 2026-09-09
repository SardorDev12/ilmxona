"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  deleteCourse,
  reviewCourse,
  reviewLesson,
  type ContentFormState,
} from "@/lib/content/mutations";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

/** Approve or return the course as a whole, lessons included. */
export function CourseDecision({
  courseId,
  isLive,
  pendingLessons,
}: {
  courseId: string;
  isLive: boolean;
  pendingLessons: number;
}) {
  const [state, action] = useActionState<ContentFormState, FormData>(
    reviewCourse,
    {},
  );
  const [askingChanges, setAskingChanges] = useState(false);

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5">
        <h2 className="font-semibold">Kurs bo&apos;yicha qaror</h2>
        <p className="text-sm text-muted-foreground">
          {isLive
            ? `Tasdiqlansa, kutayotgan ${pendingLessons} ta dars nashr etiladi. Kursning o'zi allaqachon saytda.`
            : "Tasdiqlansa, kurs va uning kutayotgan darslari birgalikda nashr etiladi."}
        </p>

        <Message state={state} />

        <form action={action} className="flex flex-col gap-3">
          <input type="hidden" name="id" value={courseId} />

          {askingChanges && (
            <Textarea
              name="note"
              rows={3}
              required
              placeholder="Nimani tuzatish kerakligini yozing — muallif shu izohni ko'radi."
            />
          )}

          <div className="flex flex-wrap gap-2">
            {askingChanges ? (
              <>
                <DecisionButton
                  value="changes"
                  label="O'zgartirish so'rash"
                  variant="outline"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAskingChanges(false)}
                >
                  Bekor qilish
                </Button>
              </>
            ) : (
              <>
                <DecisionButton
                  value="publish"
                  label={isLive ? "Yangilanishni tasdiqlash" : "Tasdiqlash va nashr etish"}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAskingChanges(true)}
                >
                  O&apos;zgartirish so&apos;rash
                </Button>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/** The same two outcomes for one lesson inside the course. */
export function LessonDecision({ lessonId }: { lessonId: string }) {
  const [state, action] = useActionState<ContentFormState, FormData>(
    reviewLesson,
    {},
  );
  const [askingChanges, setAskingChanges] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Message state={state} />

      <form action={action} className="flex flex-col gap-2">
        <input type="hidden" name="id" value={lessonId} />

        {askingChanges && (
          <Textarea
            name="note"
            rows={2}
            required
            placeholder="Bu darsda nimani tuzatish kerak?"
          />
        )}

        <div className="flex flex-wrap gap-2">
          {askingChanges ? (
            <>
              <DecisionButton
                value="changes"
                label="Qaytarish"
                variant="outline"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAskingChanges(false)}
              >
                Bekor qilish
              </Button>
            </>
          ) : (
            <>
              <DecisionButton value="publish" label="Darsni tasdiqlash" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAskingChanges(true)}
              >
                O&apos;zgartirish so&apos;rash
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

/** Admin-only, and deliberately awkward: the title has to be typed out. */
export function DeleteCourse({
  courseId,
  title,
  lessonCount,
}: {
  courseId: string;
  title: string;
  lessonCount: number;
}) {
  const [state, action] = useActionState<ContentFormState, FormData>(
    deleteCourse,
    {},
  );
  const [open, setOpen] = useState(false);

  return (
    <Card className="border-destructive/40">
      <CardContent className="flex flex-col gap-3 p-5">
        <h2 className="font-semibold text-destructive">Kursni o&apos;chirish</h2>
        <p className="text-sm text-muted-foreground">
          Kurs bilan birga uning {lessonCount} ta darsi va barcha modullari
          o&apos;chadi. Buni qaytarib bo&apos;lmaydi.
        </p>

        <Message state={state} />

        {open ? (
          <form action={action} className="flex flex-col gap-3">
            <input type="hidden" name="id" value={courseId} />
            <input type="hidden" name="expected" value={title} />
            <label className="text-sm" htmlFor="confirm">
              Tasdiqlash uchun kurs nomini kiriting:{" "}
              <span className="font-medium">{title}</span>
            </label>
            <Input id="confirm" name="confirm" autoComplete="off" required />
            <div className="flex flex-wrap gap-2">
              <DeleteButton />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Bekor qilish
              </Button>
            </div>
          </form>
        ) : (
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-destructive text-destructive"
              onClick={() => setOpen(true)}
            >
              Kursni o&apos;chirish
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DecisionButton({
  value,
  label,
  variant,
}: {
  value: string;
  label: string;
  variant?: "outline";
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      name="decision"
      value={value}
      size="sm"
      variant={variant}
      disabled={pending}
    >
      {pending ? "Bajarilmoqda…" : label}
    </Button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size="sm"
      variant="outline"
      className="border-destructive text-destructive"
      disabled={pending}
    >
      {pending ? "O'chirilmoqda…" : "Butunlay o'chirish"}
    </Button>
  );
}

function Message({ state }: { state: ContentFormState }) {
  if (state.error) {
    return <p className="text-sm text-destructive">{state.error}</p>;
  }
  if (state.ok) return <p className="text-sm text-accent">{state.ok}</p>;
  return null;
}
