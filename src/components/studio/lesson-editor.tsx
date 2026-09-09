"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import {
  getServerCourseDrafts,
  getStoredCourseDrafts,
  subscribeToCourseDrafts,
} from "@/lib/studio/course-draft";
import {
  EMPTY_DRAFT,
  EMPTY_EXERCISE,
  STATUS_LABELS,
  clearDraft,
  getServerDraft,
  getStoredDraft,
  saveDraft,
  slugify,
  subscribeToStoredDraft,
  validationIssues,
  type LessonDraft,
} from "@/lib/studio/draft";
import { BlockEditor } from "./block-editor";
import { QuizEditor } from "./quiz-editor";
import { LessonBody } from "@/components/content/lesson-body";
import { Quiz } from "@/components/content/quiz";
import { ExerciseBlock } from "@/components/content/exercise";
import { Input, Textarea, Select, Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

/** A course a lesson can be filed under — published, or the author's own draft. */
export type CourseOption = {
  slug: string;
  title: string;
  modules: string[];
  isDraft?: boolean;
};

export function LessonEditor({
  publishedCourses,
  initialCourseSlug = "",
}: {
  publishedCourses: CourseOption[];
  initialCourseSlug?: string;
}) {
  // A draft left over from a previous visit. Read through the store rather
  // than an effect so the server render (no localStorage) and the first
  // client render agree.
  const stored = useSyncExternalStore(
    subscribeToStoredDraft,
    getStoredDraft,
    getServerDraft,
  );

  // Courses this author has drafted but not yet published. Without these a
  // lesson for a brand-new subject would have nowhere to go.
  const courseDrafts = useSyncExternalStore(
    subscribeToCourseDrafts,
    getStoredCourseDrafts,
    getServerCourseDrafts,
  );

  const [edited, setEdited] = useState<LessonDraft | null>(null);
  const [tab, setTab] = useState<TabId>("meta");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [showIssues, setShowIssues] = useState(false);

  const courses: CourseOption[] = [
    ...publishedCourses,
    ...courseDrafts.map((c) => ({
      slug: c.slug,
      title: c.title || "Nomsiz kurs",
      modules: c.moduleTitles.filter((m) => m.trim() !== ""),
      isDraft: true,
    })),
  ];

  const initial =
    initialCourseSlug && !stored
      ? { ...EMPTY_DRAFT, courseSlug: initialCourseSlug }
      : EMPTY_DRAFT;

  const draft = edited ?? stored ?? initial;
  const restored = edited === null && stored !== null;

  const issues = validationIssues(draft);
  const canSubmit = issues.length === 0;
  const course = courses.find((c) => c.slug === draft.courseSlug);

  function setDraft(update: (current: LessonDraft) => LessonDraft) {
    setEdited(update(draft));
  }

  function set<K extends keyof LessonDraft>(key: K, value: LessonDraft[K]) {
    setEdited({ ...draft, [key]: value });
  }

  function handleSave() {
    if (saveDraft(draft)) {
      setSavedAt(new Date().toLocaleTimeString("uz"));
    }
  }

  function handleSubmit() {
    setShowIssues(true);
    if (!canSubmit) return;

    const submitted: LessonDraft = { ...draft, status: "SUBMITTED" };
    setEdited(submitted);
    saveDraft(submitted);
    setTab("preview");
  }

  return (
    <div className="flex flex-col gap-6">
      {restored && draft.status === "DRAFT" && (
        <p className="rounded-lg border border-border bg-muted px-4 py-3 text-sm">
          Saqlangan qoralama tiklandi.{" "}
          <button
            type="button"
            className="cursor-pointer font-medium text-primary hover:underline"
            onClick={() => {
              clearDraft();
              setEdited(EMPTY_DRAFT);
            }}
          >
            Yangidan boshlash
          </button>
        </p>
      )}

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

        <div className="flex items-center gap-2">
          <Badge variant={draft.status === "DRAFT" ? "default" : "primary"}>
            {STATUS_LABELS[draft.status]}
          </Badge>
          {savedAt && (
            <span className="text-xs text-muted-foreground">
              Saqlandi {savedAt}
            </span>
          )}
        </div>
      </div>

      {tab === "meta" && (
        <div className="flex max-w-2xl flex-col gap-5">
          <Field label="Dars sarlavhasi" htmlFor="title">
            <Input
              id="title"
              value={draft.title}
              placeholder="Masalan: Massivlar"
              onChange={(e) => {
                const title = e.target.value;
                setDraft((d) => ({
                  ...d,
                  title,
                  // Keep the slug in step with the title until the author
                  // edits it themselves.
                  slug:
                    d.slug === "" || d.slug === slugify(d.title)
                      ? slugify(title)
                      : d.slug,
                }));
              }}
            />
          </Field>

          <Field
            label="URL manzili"
            htmlFor="slug"
            hint={
              course
                ? `/courses/${course.slug}/lessons/${draft.slug || "..."}`
                : "Sarlavhadan avtomatik hosil bo'ladi."
            }
          >
            <Input
              id="slug"
              value={draft.slug}
              onChange={(e) => set("slug", slugify(e.target.value))}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Kurs"
              htmlFor="course"
              hint={
                course?.isDraft
                  ? "Bu kurs hali qoralama — u tasdiqlangach dars ham ko'rinadi."
                  : undefined
              }
            >
              <Select
                id="course"
                value={draft.courseSlug}
                onChange={(e) => {
                  const courseSlug = e.target.value;
                  const selected = courses.find((c) => c.slug === courseSlug);
                  setDraft((d) => ({
                    ...d,
                    courseSlug,
                    moduleTitle: selected?.modules[0] ?? "",
                  }));
                }}
              >
                <option value="">Tanlang...</option>
                <optgroup label="Nashr etilgan kurslar">
                  {courses
                    .filter((c) => !c.isDraft)
                    .map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.title}
                      </option>
                    ))}
                </optgroup>
                {courses.some((c) => c.isDraft) && (
                  <optgroup label="Sizning qoralamalaringiz">
                    {courses
                      .filter((c) => c.isDraft)
                      .map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.title}
                        </option>
                      ))}
                  </optgroup>
                )}
              </Select>
            </Field>

            <Field label="Modul" htmlFor="module">
              <Select
                id="module"
                value={draft.moduleTitle}
                disabled={!course}
                onChange={(e) => set("moduleTitle", e.target.value)}
              >
                {course ? (
                  course.modules.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))
                ) : (
                  <option value="">Avval kursni tanlang</option>
                )}
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
              value={draft.durationMin}
              onChange={(e) =>
                set("durationMin", Number(e.target.value) || 1)
              }
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
              value={draft.intro}
              onChange={(e) => set("intro", e.target.value)}
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
              value={draft.whyImportant}
              onChange={(e) => set("whyImportant", e.target.value)}
            />
          </Field>
        </div>
      )}

      {tab === "content" && (
        <div className="flex flex-col gap-8">
          <BlockEditor
            blocks={draft.body}
            onChange={(body) => set("body", body)}
          />

          <Field
            label="Ko'p uchraydigan xatolar"
            hint="Har bir xato alohida qatorda."
          >
            <Textarea
              rows={4}
              value={draft.commonMistakes.join("\n")}
              placeholder={"Birinchi xato\nIkkinchi xato"}
              onChange={(e) =>
                set(
                  "commonMistakes",
                  e.target.value.split("\n").filter((l) => l.trim() !== ""),
                )
              }
            />
          </Field>
        </div>
      )}

      {tab === "exercise" && (
        <div className="flex max-w-2xl flex-col gap-5">
          {draft.exercise === null ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
              <p className="mb-3 text-sm text-muted-foreground">
                Bu darsda mashq yo&apos;q. Mashq ixtiyoriy, lekin amaliy
                mavzular uchun tavsiya etiladi.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => set("exercise", { ...EMPTY_EXERCISE })}
              >
                Mashq qo&apos;shish
              </Button>
            </div>
          ) : (
            <>
              <Field label="Mashq sarlavhasi">
                <Input
                  value={draft.exercise.title}
                  onChange={(e) =>
                    set("exercise", {
                      ...draft.exercise!,
                      title: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Topshiriq">
                <Textarea
                  rows={3}
                  value={draft.exercise.instructions}
                  onChange={(e) =>
                    set("exercise", {
                      ...draft.exercise!,
                      instructions: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Boshlang'ich kod">
                <Textarea
                  rows={5}
                  className="font-mono text-xs"
                  spellCheck={false}
                  value={draft.exercise.starterCode}
                  onChange={(e) =>
                    set("exercise", {
                      ...draft.exercise!,
                      starterCode: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Yechim">
                <Textarea
                  rows={5}
                  className="font-mono text-xs"
                  spellCheck={false}
                  value={draft.exercise.solution}
                  onChange={(e) =>
                    set("exercise", {
                      ...draft.exercise!,
                      solution: e.target.value,
                    })
                  }
                />
              </Field>

              <Field
                label="Maslahatlar"
                hint="Har bir maslahat alohida qatorda — o'quvchi ularni birma-bir ochadi."
              >
                <Textarea
                  rows={3}
                  value={draft.exercise.hints.join("\n")}
                  onChange={(e) =>
                    set("exercise", {
                      ...draft.exercise!,
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
                  onClick={() => set("exercise", null)}
                >
                  Mashqni olib tashlash
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {tab === "quiz" && (
        <QuizEditor quiz={draft.quiz} onChange={(quiz) => set("quiz", quiz)} />
      )}

      {tab === "preview" && (
        <div className="flex flex-col gap-8">
          <p className="text-sm text-muted-foreground">
            O&apos;quvchi darsni shu ko&apos;rinishda ko&apos;radi.
          </p>

          <article className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight">
              {draft.title || "Sarlavhasiz dars"}
            </h1>
            {draft.intro && (
              <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
                {draft.intro}
              </p>
            )}

            {draft.whyImportant && (
              <section className="mt-6 rounded-xl border border-border bg-muted/50 p-5">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Nima uchun bu muhim?
                </h2>
                <p className="leading-relaxed">{draft.whyImportant}</p>
              </section>
            )}

            <div className="mt-8">
              <LessonBody blocks={draft.body} />
            </div>

            {draft.commonMistakes.length > 0 && (
              <section className="mt-10">
                <h2 className="mb-4 text-xl font-semibold">
                  Ko&apos;p uchraydigan xatolar
                </h2>
                <ul className="flex flex-col gap-2">
                  {draft.commonMistakes.map((m) => (
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

            {draft.exercise && (
              <section className="mt-10">
                <h2 className="mb-1 text-xl font-semibold">Mashq</h2>
                <p className="mb-4 text-sm font-medium text-muted-foreground">
                  {draft.exercise.title}
                </p>
                <ExerciseBlock exercise={draft.exercise} />
              </section>
            )}

            {draft.quiz.length > 0 && (
              <section className="mt-10">
                <h2 className="mb-4 text-xl font-semibold">Test</h2>
                <Quiz questions={draft.quiz} />
              </section>
            )}
          </article>
        </div>
      )}

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        <Button type="button" variant="outline" onClick={handleSave}>
          Qoralamani saqlash
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={draft.status !== "DRAFT"}
        >
          Ko&apos;rib chiqishga yuborish
        </Button>

        {draft.status !== "DRAFT" ? (
          <span className="text-sm text-muted-foreground">
            Dars ko&apos;rib chiqishga yuborildi.
          </span>
        ) : (
          !canSubmit && (
            <span className="text-sm text-muted-foreground">
              Yuborish uchun {issues.length} ta talab bajarilishi kerak
            </span>
          )
        )}
      </div>

      {showIssues && issues.length > 0 && (
        <Card className="border-destructive">
          <CardContent className="p-5">
            <h2 className="mb-2 font-semibold">
              Yuborishdan oldin to&apos;ldirilishi kerak
            </h2>
            <ul className="ml-5 flex list-disc flex-col gap-1 text-sm">
              {issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
