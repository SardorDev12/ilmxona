"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  ACCENTS,
  CATEGORIES,
  DIFFICULTIES,
  slugify,
  type Course,
} from "@/lib/content/types";
import {
  createCourse,
  updateCourse,
  type ContentFormState,
} from "@/lib/content/mutations";
import { Input, Textarea, Select, Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  /** Omitted when creating; supplied to edit an existing course. */
  course?: Course;
  moduleTitles?: string[];
};

/**
 * Only a name is needed to start a course. Everything else is real but
 * optional, so it sits behind one disclosure rather than meeting the
 * author as an eleven-field wall — the course can be filled in later
 * from its workspace.
 */
export function CourseEditor({ course, moduleTitles = [] }: Props) {
  const editing = course !== undefined;

  const [state, action] = useActionState<ContentFormState, FormData>(
    editing ? updateCourse : createCourse,
    {},
  );

  const [title, setTitle] = useState(course?.title ?? "");
  const [slug, setSlug] = useState(course?.slug ?? "");
  // An existing course keeps the URL it was given; a new one follows the
  // title until the author takes the wheel.
  const [slugEdited, setSlugEdited] = useState(editing);
  const [editingSlug, setEditingSlug] = useState(false);
  const [subtitle, setSubtitle] = useState(course?.subtitle ?? "");
  const [difficulty, setDifficulty] = useState(
    course?.difficulty ?? DIFFICULTIES[0],
  );
  const [hours, setHours] = useState(course?.duration_hours ?? 10);
  const [accent, setAccent] = useState(course?.accent ?? ACCENTS[0].value);
  const [modules, setModules] = useState<string[]>(
    moduleTitles.length > 0 ? moduleTitles : [""],
  );
  const [showMore, setShowMore] = useState(false);

  const effectiveSlug = slug || slugify(title);

  return (
    <form action={action} className="flex flex-col gap-6">
      {editing && <input type="hidden" name="id" value={course.id} />}
      <input type="hidden" name="slug" value={effectiveSlug} />
      <input type="hidden" name="accent" value={accent} />
      <input
        type="hidden"
        name="modules"
        value={modules.filter((m) => m.trim()).join("\n")}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex flex-col gap-5">
          <Field label="Kurs nomi" htmlFor="title">
            <Input
              id="title"
              name="title"
              required
              autoFocus={!editing}
              value={title}
              placeholder="Masalan: Moliyaviy savodxonlik"
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugEdited) setSlug(slugify(e.target.value));
              }}
            />
          </Field>

          <Field
            label="Bir jumlada nima haqida?"
            htmlFor="subtitle"
            hint="Kurs kartochkasida nom ostida ko'rinadi. Keyin ham o'zgartirsa bo'ladi."
          >
            <Input
              id="subtitle"
              name="subtitle"
              value={subtitle}
              placeholder="Oylik daromadni rejalashtirish va jamg'arishni o'rganasiz"
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </Field>

          {/* The URL is a detail, not a decision to make up front. */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>Manzil:</span>
            {editingSlug ? (
              <>
                <span>/courses/</span>
                <Input
                  aria-label="URL manzili"
                  className="h-8 w-48"
                  value={effectiveSlug}
                  onChange={(e) => {
                    setSlugEdited(true);
                    setSlug(slugify(e.target.value));
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingSlug(false)}
                >
                  Tayyor
                </Button>
              </>
            ) : (
              <>
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  /courses/{effectiveSlug || "..."}
                </code>
                <button
                  type="button"
                  className="cursor-pointer text-primary hover:underline"
                  onClick={() => setEditingSlug(true)}
                >
                  O&apos;zgartirish
                </button>
              </>
            )}
          </div>

          <div className="border-t border-border pt-5">
            <button
              type="button"
              aria-expanded={showMore}
              onClick={() => setShowMore(!showMore)}
              className="flex cursor-pointer items-center gap-2 text-sm font-medium hover:text-primary"
            >
              <span aria-hidden>{showMore ? "▾" : "▸"}</span>
              Qo&apos;shimcha ma&apos;lumot
              <span className="font-normal text-muted-foreground">
                (ixtiyoriy)
              </span>
            </button>

            {showMore && (
              <div className="mt-5 flex flex-col gap-5">
                <Field label="To'liq tavsif" htmlFor="description">
                  <Textarea
                    id="description"
                    name="description"
                    rows={4}
                    defaultValue={course?.description ?? ""}
                    placeholder="Kurs kimga mo'ljallangan va nimalarni qamrab oladi?"
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Kategoriya" htmlFor="category">
                    <Select
                      id="category"
                      name="category"
                      defaultValue={course?.category ?? CATEGORIES[0]}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Daraja" htmlFor="difficulty">
                    <Select
                      id="difficulty"
                      name="difficulty"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                    >
                      {DIFFICULTIES.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Davomiyligi (soat)" htmlFor="hours">
                    <Input
                      id="hours"
                      name="duration_hours"
                      type="number"
                      min={1}
                      max={500}
                      value={hours}
                      onChange={(e) => setHours(Number(e.target.value) || 1)}
                    />
                  </Field>
                </div>

                <Field
                  label="Nimalarni o'rganadi"
                  htmlFor="objectives"
                  hint="Har bir natija alohida qatorda."
                >
                  <Textarea
                    id="objectives"
                    name="objectives"
                    rows={3}
                    defaultValue={(course?.objectives ?? []).join("\n")}
                    placeholder={"Oylik byudjet tuzish\nJamg'armani rejalashtirish"}
                  />
                </Field>

                <Field
                  label="Talablar"
                  htmlFor="prerequisites"
                  hint="Kursni boshlashdan oldin nima bilish kerak? Har biri alohida qatorda."
                >
                  <Textarea
                    id="prerequisites"
                    name="prerequisites"
                    rows={2}
                    defaultValue={(course?.prerequisites ?? []).join("\n")}
                  />
                </Field>

                <Field label="Muqova rangi">
                  <div className="flex flex-wrap gap-2">
                    {ACCENTS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        aria-label={option.label}
                        aria-pressed={accent === option.value}
                        onClick={() => setAccent(option.value)}
                        className={cn(
                          "h-10 w-16 cursor-pointer rounded-md bg-gradient-to-br ring-offset-2 ring-offset-background transition-shadow",
                          option.value,
                          accent === option.value && "ring-2 ring-ring",
                        )}
                      />
                    ))}
                  </div>
                </Field>

                <div className="flex flex-col gap-3">
                  <div>
                    <h2 className="text-sm font-medium">Modullar</h2>
                    <p className="text-xs text-muted-foreground">
                      Darslarni bo&apos;limlarga ajratish uchun. Bo&apos;sh
                      qoldirsangiz darslar bitta ro&apos;yxatda turadi.
                    </p>
                  </div>

                  {modules.map((moduleTitle, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-6 shrink-0 text-sm text-muted-foreground">
                        {index + 1}.
                      </span>
                      <Input
                        value={moduleTitle}
                        placeholder="Modul nomi"
                        aria-label={`${index + 1}-modul nomi`}
                        onChange={(e) =>
                          setModules(
                            modules.map((m, i) =>
                              i === index ? e.target.value : m,
                            ),
                          )
                        }
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        aria-label="Yuqoriga ko'chirish"
                        disabled={index === 0}
                        onClick={() => {
                          const next = [...modules];
                          [next[index - 1], next[index]] = [
                            next[index],
                            next[index - 1],
                          ];
                          setModules(next);
                        }}
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        aria-label="Modulni o'chirish"
                        disabled={modules.length === 1}
                        onClick={() =>
                          setModules(modules.filter((_, i) => i !== index))
                        }
                      >
                        ✕
                      </Button>
                    </div>
                  ))}

                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setModules([...modules, ""])}
                    >
                      + Modul qo&apos;shish
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Ko&apos;rinishi
          </p>
          <Card className="overflow-hidden">
            <div
              className={`flex h-24 items-end bg-gradient-to-br ${accent} p-4`}
            >
              <span className="text-lg font-bold text-white drop-shadow-sm">
                {title || "Kurs nomi"}
              </span>
            </div>
            <CardContent className="flex flex-col gap-3 p-4">
              <p className="text-sm text-muted-foreground">
                {subtitle || "Bir jumlali tavsif"}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">{difficulty}</Badge>
                <span>{hours} soat</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      {state.error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-sm text-destructive">
            {state.error}
          </CardContent>
        </Card>
      )}

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        <SubmitButton
          disabled={title.trim() === ""}
          label={editing ? "Saqlash" : "Kursni yaratish"}
        />
        <span className="text-sm text-muted-foreground">
          {editing
            ? "O'zgarishlar darhol saqlanadi."
            : "Keyingi qadam — birinchi darsni yozish."}
        </span>
      </div>
    </form>
  );
}

function SubmitButton({
  disabled,
  label,
}: {
  disabled: boolean;
  label: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Saqlanmoqda…" : label}
    </Button>
  );
}
