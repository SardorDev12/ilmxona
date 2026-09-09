"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { Block, Exercise, QuizQuestion } from "@/lib/content/types";
import { slugify } from "@/lib/content/types";
import { EMPTY_EXERCISE } from "@/lib/content/editor";
import { createLesson, type ContentFormState } from "@/lib/content/mutations";
import { BlockEditor } from "./block-editor";
import { QuizEditor } from "./quiz-editor";
import { LessonBody } from "@/components/content/lesson-body";
import { Quiz } from "@/components/content/quiz";
import { ExerciseBlock } from "@/components/content/exercise";
import { Input, Textarea, Select, Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "meta", label: "Ma'lumot" },
  { id: "content", label: "Dars matni" },
  { id: "exercise", label: "Mashq" },
  { id: "quiz", label: "Test" },
  { id: "preview", label: "Ko'rish" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/** A course the author may file a lesson under — their own, or published. */
export type CourseOption = {
  id: string;
  slug: string;
  title: string;
  status: string;
  modules: { id: string; title: string }[];
};

export function LessonEditor({
  courses,
  initialCourseSlug = "",
}: {
  courses: CourseOption[];
  initialCourseSlug?: string;
}) {
  const [state, action] = useActionState<ContentFormState, FormData>(
    createLesson,
    {},
  );

  const [tab, setTab] = useState<TabId>("meta");

  const [courseId, setCourseId] = useState(
    courses.find((c) => c.slug === initialCourseSlug)?.id ?? "",
  );
  const [moduleId, setModuleId] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [intro, setIntro] = useState("");
  const [whyImportant, setWhyImportant] = useState("");
  const [durationMin, setDurationMin] = useState(10);
  const [body, setBody] = useState<Block[]>([]);
  const [commonMistakes, setCommonMistakes] = useState("");
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [relatedTerms, setRelatedTerms] = useState("");

  const course = courses.find((c) => c.id === courseId);

  // Told to the author before the server refuses, so an incomplete draft
  // does not cost a round trip.
  const issues: string[] = [];
  if (!courseId) issues.push("Kurs tanlanmagan.");
  if (!title.trim()) issues.push("Dars sarlavhasi kiritilmagan.");
  if (!slug.trim()) issues.push("URL manzili bo'sh.");
  if (body.length === 0)
    issues.push("Dars matni bo'sh — kamida bitta blok qo'shing.");

  return (
    <form action={action} className="flex flex-col gap-6">
      {/* Structured parts travel as JSON; everything else is a plain field. */}
      <input type="hidden" name="course_id" value={courseId} />
      <input type="hidden" name="module_id" value={moduleId} />
      <input type="hidden" name="body" value={JSON.stringify(body)} />
      <input type="hidden" name="quiz" value={JSON.stringify(quiz)} />
      <input
        type="hidden"
        name="exercise"
        value={exercise ? JSON.stringify(exercise) : ""}
      />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="intro" value={intro} />
      <input type="hidden" name="why_important" value={whyImportant} />
      <input type="hidden" name="duration_min" value={durationMin} />
      <input type="hidden" name="common_mistakes" value={commonMistakes} />
      <input type="hidden" name="related_terms" value={relatedTerms} />

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                tab === t.id
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "meta" && (
        <div className="flex max-w-2xl flex-col gap-5">
          <Field label="Dars sarlavhasi" htmlFor="title">
            <Input
              id="title"
              value={title}
              placeholder="Masalan: Byudjet tuzish"
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugEdited) setSlug(slugify(e.target.value));
              }}
            />
          </Field>

          <Field
            label="URL manzili"
            htmlFor="slug"
            hint={
              course
                ? `/courses/${course.slug}/lessons/${slug || "..."}`
                : "Sarlavhadan avtomatik hosil bo'ladi."
            }
          >
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlugEdited(true);
                setSlug(slugify(e.target.value));
              }}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Kurs"
              htmlFor="course"
              hint={
                course && course.status !== "PUBLISHED"
                  ? "Bu kurs hali nashr etilmagan — u tasdiqlangach dars ham ko'rinadi."
                  : undefined
              }
            >
              <Select
                id="course"
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value);
                  setModuleId("");
                }}
              >
                <option value="">Tanlang...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                    {c.status !== "PUBLISHED" ? " (qoralama)" : ""}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Modul" htmlFor="module">
              <Select
                id="module"
                value={moduleId}
                disabled={!course || course.modules.length === 0}
                onChange={(e) => setModuleId(e.target.value)}
              >
                <option value="">
                  {course
                    ? course.modules.length === 0
                      ? "Bu kursda modul yo'q"
                      : "Modulsiz"
                    : "Avval kursni tanlang"}
                </option>
                {course?.modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <p className="-mt-2 text-sm text-muted-foreground">
            Kerakli kurs ro&apos;yxatda yo&apos;qmi?{" "}
            <Link
              href="/contributor/courses/new"
              className="font-medium text-primary hover:underline"
            >
              Yangi kurs yarating
            </Link>
            .
          </p>

          <Field
            label="Davomiyligi (daqiqa)"
            htmlFor="duration"
            hint="O'quvchi darsni o'qib chiqishi uchun taxminiy vaqt."
          >
            <Input
              id="duration"
              type="number"
              min={1}
              max={120}
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value) || 1)}
            />
          </Field>

          <Field
            label="Qisqa tavsif"
            htmlFor="intro"
            hint="Dars sarlavhasi ostida va ro'yxatlarda ko'rinadi."
          >
            <Textarea
              id="intro"
              rows={3}
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
            />
          </Field>

          <Field
            label="Nima uchun bu muhim?"
            htmlFor="why"
            hint="O'quvchiga mavzu qayerda asqotishini tushuntiring."
          >
            <Textarea
              id="why"
              rows={3}
              value={whyImportant}
              onChange={(e) => setWhyImportant(e.target.value)}
            />
          </Field>

          <Field
            label="Bog'liq atamalar"
            htmlFor="terms"
            hint="Lug'atdagi atama manzillari, har biri alohida qatorda."
          >
            <Textarea
              id="terms"
              rows={2}
              value={relatedTerms}
              onChange={(e) => setRelatedTerms(e.target.value)}
            />
          </Field>
        </div>
      )}

      {tab === "content" && (
        <div className="flex flex-col gap-8">
          <BlockEditor blocks={body} onChange={setBody} />

          <Field
            label="Ko'p uchraydigan xatolar"
            htmlFor="mistakes"
            hint="Har bir xato alohida qatorda."
          >
            <Textarea
              id="mistakes"
              rows={4}
              value={commonMistakes}
              placeholder={"Birinchi xato\nIkkinchi xato"}
              onChange={(e) => setCommonMistakes(e.target.value)}
            />
          </Field>
        </div>
      )}

      {tab === "exercise" && (
        <div className="flex max-w-2xl flex-col gap-5">
          {exercise === null ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
              <p className="mb-3 text-sm text-muted-foreground">
                Bu darsda mashq yo&apos;q. Mashq ixtiyoriy, lekin amaliy
                mavzular uchun tavsiya etiladi.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setExercise({ ...EMPTY_EXERCISE })}
              >
                Mashq qo&apos;shish
              </Button>
            </div>
          ) : (
            <>
              <Field label="Mashq sarlavhasi">
                <Input
                  value={exercise.title}
                  onChange={(e) =>
                    setExercise({ ...exercise, title: e.target.value })
                  }
                />
              </Field>

              <Field label="Topshiriq">
                <Textarea
                  rows={3}
                  value={exercise.instructions}
                  onChange={(e) =>
                    setExercise({ ...exercise, instructions: e.target.value })
                  }
                />
              </Field>

              <Field label="Boshlang'ich kod">
                <Textarea
                  rows={5}
                  className="font-mono text-xs"
                  spellCheck={false}
                  value={exercise.starterCode}
                  onChange={(e) =>
                    setExercise({ ...exercise, starterCode: e.target.value })
                  }
                />
              </Field>

              <Field label="Yechim">
                <Textarea
                  rows={5}
                  className="font-mono text-xs"
                  spellCheck={false}
                  value={exercise.solution}
                  onChange={(e) =>
                    setExercise({ ...exercise, solution: e.target.value })
                  }
                />
              </Field>

              <Field
                label="Maslahatlar"
                hint="Har bir maslahat alohida qatorda — o'quvchi ularni birma-bir ochadi."
              >
                <Textarea
                  rows={3}
                  value={exercise.hints.join("\n")}
                  onChange={(e) =>
                    setExercise({
                      ...exercise,
                      hints: e.target.value.split("\n"),
                    })
                  }
                />
              </Field>

              <div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => setExercise(null)}
                >
                  Mashqni olib tashlash
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {tab === "quiz" && <QuizEditor quiz={quiz} onChange={setQuiz} />}

      {tab === "preview" && (
        <div className="flex flex-col gap-8">
          <p className="text-sm text-muted-foreground">
            O&apos;quvchi darsni shu ko&apos;rinishda ko&apos;radi.
          </p>

          <article className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight">
              {title || "Sarlavhasiz dars"}
            </h1>
            {intro && (
              <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
                {intro}
              </p>
            )}

            {whyImportant && (
              <section className="mt-6 rounded-xl border border-border bg-muted/50 p-5">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Nima uchun bu muhim?
                </h2>
                <p className="leading-relaxed">{whyImportant}</p>
              </section>
            )}

            <div className="mt-8">
              <LessonBody blocks={body} />
            </div>

            {commonMistakes.trim() && (
              <section className="mt-10">
                <h2 className="mb-4 text-xl font-semibold">
                  Ko&apos;p uchraydigan xatolar
                </h2>
                <ul className="flex flex-col gap-2">
                  {commonMistakes
                    .split("\n")
                    .filter((m) => m.trim())
                    .map((m) => (
                      <li
                        key={m}
                        className="flex gap-3 rounded-lg border border-border px-4 py-3 text-sm"
                      >
                        <span className="text-destructive" aria-hidden>
                          ✗
                        </span>
                        {m}
                      </li>
                    ))}
                </ul>
              </section>
            )}

            {exercise && (
              <section className="mt-10">
                <h2 className="mb-1 text-xl font-semibold">Mashq</h2>
                <p className="mb-4 text-sm font-medium text-muted-foreground">
                  {exercise.title}
                </p>
                <ExerciseBlock exercise={exercise} />
              </section>
            )}

            {quiz.length > 0 && (
              <section className="mt-10">
                <h2 className="mb-4 text-xl font-semibold">Test</h2>
                <Quiz questions={quiz} />
              </section>
            )}
          </article>
        </div>
      )}

      {state.error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-sm text-destructive">
            {state.error}
          </CardContent>
        </Card>
      )}

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        <SubmitButton disabled={issues.length > 0} />
        {issues.length > 0 ? (
          <span className="text-sm text-muted-foreground">
            {issues[0]} ({issues.length} ta talab qoldi)
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">
            Dars qoralama sifatida saqlanadi — keyin ko&apos;rib chiqishga
            yuborasiz.
          </span>
        )}
      </div>
    </form>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Saqlanmoqda…" : "Darsni saqlash"}
    </Button>
  );
}
