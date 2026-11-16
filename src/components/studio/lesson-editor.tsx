"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useFormStatus } from "react-dom";
import type { Block, Exercise, Lesson, QuizQuestion } from "@/lib/content/types";
import { slugify } from "@/lib/content/types";
import { EMPTY_EXERCISE } from "@/lib/content/editor";
import {
  SYNTAX_HINTS,
  blocksToText,
  textToBlocks,
} from "@/lib/content/markdown";
import {
  createLesson,
  updateLesson,
  type ContentFormState,
} from "@/lib/content/mutations";
import { BlockEditor } from "./block-editor";
import { QuizEditor } from "./quiz-editor";
import { LessonBody } from "@/components/content/lesson-body";
import { Quiz } from "@/components/content/quiz";
import { ExerciseBlock } from "@/components/content/exercise";
import { Input, Textarea, Select, Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  course: { id: string; slug: string; title: string; status: string };
  modules: { id: string; title: string }[];
  /** Omitted when writing a new lesson. */
  lesson?: Lesson;
};

type Draft = {
  title: string;
  slug: string;
  intro: string;
  whyImportant: string;
  durationMin: number;
  moduleId: string;
  text: string;
  blocks: Block[];
  commonMistakes: string;
  relatedTerms: string;
  exercise: Exercise | null;
  quiz: QuizQuestion[];
};

/**
 * The saved draft is read once per key and cached, so the recovery
 * prompt does not re-appear every time autosave rewrites the entry.
 * Reading through useSyncExternalStore keeps the server render (which
 * has no localStorage) and the first client render in agreement.
 */
const firstRead = new Map<string, string | null>();

function readSavedOnce(key: string): string | null {
  if (!firstRead.has(key)) {
    try {
      firstRead.set(key, window.localStorage.getItem(key));
    } catch {
      firstRead.set(key, null);
    }
  }
  return firstRead.get(key) ?? null;
}

const neverChanges = () => () => {};

export function LessonEditor({ course, modules, lesson }: Props) {
  const editing = lesson !== undefined;

  const [state, action] = useActionState<ContentFormState, FormData>(
    editing ? updateLesson : createLesson,
    {},
  );

  const initial: Draft = {
    title: lesson?.title ?? "",
    slug: lesson?.slug ?? "",
    intro: lesson?.intro ?? "",
    whyImportant: lesson?.why_important ?? "",
    durationMin: lesson?.duration_min ?? 10,
    moduleId: lesson?.module_id ?? "",
    text: blocksToText(lesson?.body ?? []),
    blocks: lesson?.body ?? [],
    commonMistakes: (lesson?.common_mistakes ?? []).join("\n"),
    relatedTerms: (lesson?.related_terms ?? []).join("\n"),
    exercise: lesson?.exercise ?? null,
    quiz: lesson?.quiz ?? [],
  };

  const [draft, setDraft] = useState<Draft>(initial);
  const [slugEdited, setSlugEdited] = useState(editing);
  const [structured, setStructured] = useState(false);
  const [preview, setPreview] = useState(false);
  const [dismissedRecovery, setDismissedRecovery] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  // One key per lesson, so two half-written lessons never overwrite each
  // other and a recovered draft lands back where it came from.
  const storageKey = `ilmxona:lesson:${course.id}:${lesson?.id ?? "new"}`;
  const submitted = useRef(false);

  // Autosave. A long lesson survives a closed tab, a failed submit, or a
  // mis-click on the back button.
  useEffect(() => {
    if (submitted.current) return;
    const timer = setTimeout(() => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(draft));
        setSavedAt(new Date().toLocaleTimeString("uz"));
      } catch {
        // A browser with storage disabled just loses the safety net.
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [draft, storageKey]);

  // Offer, rather than silently apply, whatever was left behind: the
  // author may well have meant to start over.
  const saved = useSyncExternalStore(
    neverChanges,
    () => readSavedOnce(storageKey),
    () => null,
  );

  const recovered = parseRecovered(saved, initial, dismissedRecovery);

  const blocks = structured ? draft.blocks : textToBlocks(draft.text, draft.blocks);
  const effectiveSlug = draft.slug || slugify(draft.title);

  const issues: string[] = [];
  if (!draft.title.trim()) issues.push("Dars sarlavhasi kiritilmagan.");
  if (blocks.length === 0) issues.push("Dars matni bo'sh.");

  return (
    <form
      action={action}
      onSubmit={() => {
        submitted.current = true;
        try {
          window.localStorage.removeItem(storageKey);
        } catch {
          // Nothing to clean up.
        }
      }}
      className="flex flex-col gap-6"
    >
      {editing && <input type="hidden" name="id" value={lesson.id} />}
      <input type="hidden" name="course_id" value={course.id} />
      <input type="hidden" name="module_id" value={draft.moduleId} />
      <input type="hidden" name="title" value={draft.title} />
      <input type="hidden" name="slug" value={effectiveSlug} />
      <input type="hidden" name="intro" value={draft.intro} />
      <input type="hidden" name="why_important" value={draft.whyImportant} />
      <input type="hidden" name="duration_min" value={draft.durationMin} />
      <input type="hidden" name="body" value={JSON.stringify(blocks)} />
      <input type="hidden" name="quiz" value={JSON.stringify(draft.quiz)} />
      <input
        type="hidden"
        name="exercise"
        value={draft.exercise ? JSON.stringify(draft.exercise) : ""}
      />
      <input
        type="hidden"
        name="common_mistakes"
        value={draft.commonMistakes}
      />
      <input type="hidden" name="related_terms" value={draft.relatedTerms} />

      {recovered && (
        <Card className="border-primary">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-sm">
              Saqlanmagan qoralama topildi. Tiklaysizmi?
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setDraft(recovered);
                  setSlugEdited(true);
                  setDismissedRecovery(true);
                }}
              >
                Tiklash
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  try {
                    window.localStorage.removeItem(storageKey);
                  } catch {
                    // Already gone.
                  }
                  setDismissedRecovery(true);
                }}
              >
                Kerak emas
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-5">
        <div>
          <label className="sr-only" htmlFor="lesson-title">
            Dars sarlavhasi
          </label>
          <input
            id="lesson-title"
            value={draft.title}
            autoFocus={!editing}
            placeholder="Dars sarlavhasi"
            onChange={(e) => {
              set("title", e.target.value);
              if (!slugEdited) set("slug", slugify(e.target.value));
            }}
            className="w-full border-none bg-transparent text-3xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/50"
          />
          <input
            aria-label="Qisqa tavsif"
            value={draft.intro}
            placeholder="Bir-ikki jumlada dars nima haqida (ixtiyoriy)"
            onChange={(e) => set("intro", e.target.value)}
            className="mt-2 w-full border-none bg-transparent text-lg text-muted-foreground outline-none placeholder:text-muted-foreground/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-border py-2 text-sm text-muted-foreground">
          <span>
            Kurs: <span className="text-foreground">{course.title}</span>
          </span>

          {modules.length > 0 && (
            <label className="flex items-center gap-2">
              Modul:
              <Select
                aria-label="Modul"
                className="h-8 w-auto"
                value={draft.moduleId}
                onChange={(e) => set("moduleId", e.target.value)}
              >
                <option value="">Modulsiz</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </Select>
            </label>
          )}

          <label className="flex items-center gap-2">
            Davomiyligi:
            <Input
              type="number"
              min={1}
              max={240}
              aria-label="Davomiyligi, daqiqa"
              className="h-8 w-20"
              value={draft.durationMin}
              onChange={(e) => set("durationMin", Number(e.target.value) || 1)}
            />
            daqiqa
          </label>

          {savedAt && !preview && (
            <span className="ml-auto text-xs">
              Brauzerda saqlandi {savedAt}
            </span>
          )}
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Dars matni</h2>
          <div className="flex gap-1">
            <ModeButton
              active={!structured && !preview}
              onClick={() => {
                setPreview(false);
                setStructured(false);
              }}
            >
              Yozish
            </ModeButton>
            <ModeButton
              active={structured && !preview}
              onClick={() => {
                // Carry whatever is typed into the structured view, so
                // switching never silently drops text.
                set("blocks", textToBlocks(draft.text, draft.blocks));
                setPreview(false);
                setStructured(true);
              }}
            >
              Bloklar
            </ModeButton>
            <ModeButton active={preview} onClick={() => setPreview(true)}>
              Ko&apos;rish
            </ModeButton>
          </div>
        </div>

        {preview ? (
          <article className="rounded-lg border border-border p-5">
            <h1 className="text-2xl font-bold tracking-tight">
              {draft.title || "Sarlavhasiz dars"}
            </h1>
            {draft.intro && (
              <p className="mt-2 text-muted-foreground">{draft.intro}</p>
            )}
            <div className="mt-6">
              <LessonBody blocks={blocks} />
            </div>
            {draft.exercise && (
              <section className="mt-8">
                <h2 className="mb-3 text-lg font-semibold">Mashq</h2>
                <ExerciseBlock exercise={draft.exercise} />
              </section>
            )}
            {draft.quiz.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-3 text-lg font-semibold">Test</h2>
                <Quiz questions={draft.quiz} />
              </section>
            )}
          </article>
        ) : structured ? (
          <BlockEditor
            blocks={draft.blocks}
            onChange={(next) => {
              set("blocks", next);
              set("text", blocksToText(next));
            }}
          />
        ) : (
          <>
            <Textarea
              aria-label="Dars matni"
              value={draft.text}
              rows={18}
              spellCheck
              placeholder={
                "Shunchaki yozavering.\n\n## Bo'lim sarlavhasi\n\n- ro'yxat elementi\n- yana biri\n\n> Eslatma uchun\n\nMurakkab jadval yoki interaktiv misol kerak bo'lsa, \"Bloklar\" rejimiga o'ting."
              }
              onChange={(e) => set("text", e.target.value)}
              className="min-h-96 font-[inherit] text-base leading-relaxed"
            />
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {SYNTAX_HINTS.map((hint) => (
                <span key={hint.syntax}>
                  <code className="rounded bg-muted px-1 py-0.5">
                    {hint.syntax}
                  </code>{" "}
                  {hint.label}
                </span>
              ))}
            </div>
          </>
        )}
      </section>

      <Section title="Qo'shimcha matn" summary="Nima uchun muhim, xatolar, atamalar">
        <Field
          label="Nima uchun bu muhim?"
          htmlFor="why"
          hint="Darsning boshida alohida ajratib ko'rsatiladi."
        >
          <Textarea
            id="why"
            rows={3}
            value={draft.whyImportant}
            onChange={(e) => set("whyImportant", e.target.value)}
          />
        </Field>

        <Field
          label="Ko'p uchraydigan xatolar"
          htmlFor="mistakes"
          hint="Har bir xato alohida qatorda."
        >
          <Textarea
            id="mistakes"
            rows={3}
            value={draft.commonMistakes}
            onChange={(e) => set("commonMistakes", e.target.value)}
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
            value={draft.relatedTerms}
            onChange={(e) => set("relatedTerms", e.target.value)}
          />
        </Field>
      </Section>

      <Section
        title="Mashq"
        summary={draft.exercise ? "Qo'shilgan" : "Yo'q"}
      >
        {draft.exercise === null ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => set("exercise", { ...EMPTY_EXERCISE })}
          >
            Mashq qo&apos;shish
          </Button>
        ) : (
          <div className="flex flex-col gap-4">
            <Field label="Mashq sarlavhasi">
              <Input
                value={draft.exercise.title}
                onChange={(e) =>
                  set("exercise", { ...draft.exercise!, title: e.target.value })
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
                rows={4}
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
                rows={4}
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
          </div>
        )}
      </Section>

      <Section
        title="Test"
        summary={
          draft.quiz.length > 0 ? `${draft.quiz.length} ta savol` : "Yo'q"
        }
      >
        <QuizEditor quiz={draft.quiz} onChange={(quiz) => set("quiz", quiz)} />
      </Section>

      {state.error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-sm text-destructive">
            {state.error}
          </CardContent>
        </Card>
      )}

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        <ActionButton
          value="1"
          disabled={issues.length > 0}
          label={
            course.status === "PUBLISHED"
              ? "Saqlash va ko'rib chiqishga yuborish"
              : "Saqlash va kursga qo'shish"
          }
        />
        <ActionButton
          value="0"
          variant="outline"
          disabled={issues.length > 0}
          label="Qoralama sifatida saqlash"
        />
        <span className="text-sm text-muted-foreground">
          {issues.length > 0
            ? issues[0]
            : "Yuborilgan dars kursi bilan birga ko'rib chiqiladi."}
        </span>
      </div>
    </form>
  );
}

/** A collapsed section keeps the page about writing, not about forms. */
function Section({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-lg border border-border">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="font-medium">
          <span aria-hidden className="mr-2 text-muted-foreground">
            {open ? "▾" : "▸"}
          </span>
          {title}
        </span>
        <span className="text-sm text-muted-foreground">{summary}</span>
      </button>
      {open && (
        <div className="flex flex-col gap-4 border-t border-border p-4">
          {children}
        </div>
      )}
    </section>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function ActionButton({
  value,
  label,
  disabled,
  variant,
}: {
  value: string;
  label: string;
  disabled: boolean;
  variant?: "outline";
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      name="submit"
      value={value}
      variant={variant}
      disabled={disabled || pending}
    >
      {pending ? "Saqlanmoqda…" : label}
    </Button>
  );
}

/** A saved draft is only worth offering when it differs from what the
 *  editor would show anyway. */
function parseRecovered(
  saved: string | null,
  initial: Draft,
  dismissed: boolean,
): Draft | null {
  if (dismissed || !saved) return null;

  try {
    const parsed = JSON.parse(saved) as Draft;
    return JSON.stringify(parsed) === JSON.stringify(initial) ? null : parsed;
  } catch {
    return null;
  }
}
