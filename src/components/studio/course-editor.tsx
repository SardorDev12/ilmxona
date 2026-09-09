"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import {
  ACCENTS,
  CATEGORIES,
  DIFFICULTIES,
  courseValidationIssues,
  emptyCourseDraft,
  getServerCourseDrafts,
  getStoredCourseDrafts,
  saveCourseDraft,
  subscribeToCourseDrafts,
  type CourseDraft,
} from "@/lib/studio/course-draft";
import { STATUS_LABELS, slugify } from "@/lib/studio/draft";
import type { Difficulty } from "@/content/types";
import { Input, Textarea, Select, Field } from "@/components/ui/input";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function CourseEditor({ takenSlugs }: { takenSlugs: string[] }) {
  const stored = useSyncExternalStore(
    subscribeToCourseDrafts,
    getStoredCourseDrafts,
    getServerCourseDrafts,
  );

  const [draft, setDraft] = useState<CourseDraft>(emptyCourseDraft);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [showIssues, setShowIssues] = useState(false);
  const [created, setCreated] = useState(false);

  const issues = courseValidationIssues(draft);
  const slugTaken =
    draft.slug !== "" &&
    (takenSlugs.includes(draft.slug) ||
      stored.some((c) => c.slug === draft.slug && c.id !== draft.id));

  const allIssues = slugTaken
    ? [...issues, "Bu URL manzili band — boshqasini tanlang."]
    : issues;
  const canSubmit = allIssues.length === 0;

  function set<K extends keyof CourseDraft>(key: K, value: CourseDraft[K]) {
    setDraft({ ...draft, [key]: value });
  }

  function handleSave() {
    if (saveCourseDraft(draft)) {
      setSavedAt(new Date().toLocaleTimeString("uz"));
      setCreated(true);
    }
  }

  function handleSubmit() {
    setShowIssues(true);
    if (!canSubmit) return;

    const submitted: CourseDraft = { ...draft, status: "SUBMITTED" };
    setDraft(submitted);
    saveCourseDraft(submitted);
    setCreated(true);
  }

  const modules = draft.moduleTitles;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-3">
        <Badge variant={draft.status === "DRAFT" ? "default" : "primary"}>
          {STATUS_LABELS[draft.status]}
        </Badge>
        {savedAt && (
          <span className="text-xs text-muted-foreground">
            Saqlandi {savedAt}
          </span>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex flex-col gap-5">
          <Field label="Kurs nomi" htmlFor="title">
            <Input
              id="title"
              value={draft.title}
              placeholder="Masalan: Python asoslari"
              onChange={(e) => {
                const title = e.target.value;
                setDraft({
                  ...draft,
                  title,
                  slug:
                    draft.slug === "" || draft.slug === slugify(draft.title)
                      ? slugify(title)
                      : draft.slug,
                });
              }}
            />
          </Field>

          <Field
            label="URL manzili"
            htmlFor="slug"
            hint={`/courses/${draft.slug || "..."}`}
          >
            <Input
              id="slug"
              value={draft.slug}
              onChange={(e) => set("slug", slugify(e.target.value))}
              className={slugTaken ? "border-destructive" : undefined}
            />
          </Field>
          {slugTaken && (
            <p className="-mt-3 text-xs text-destructive">
              Bu manzil allaqachon ishlatilgan.
            </p>
          )}

          <Field
            label="Qisqa tavsif"
            htmlFor="subtitle"
            hint="Kurs kartochkasida sarlavha ostida ko'rinadi."
          >
            <Input
              id="subtitle"
              value={draft.subtitle}
              placeholder="Bir jumlada kurs nima haqida"
              onChange={(e) => set("subtitle", e.target.value)}
            />
          </Field>

          <Field label="To'liq tavsif" htmlFor="description">
            <Textarea
              id="description"
              rows={4}
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Kategoriya" htmlFor="category">
              <Select
                id="category"
                value={draft.category}
                onChange={(e) => set("category", e.target.value)}
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
                value={draft.difficulty}
                onChange={(e) =>
                  set("difficulty", e.target.value as Difficulty)
                }
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
                type="number"
                min={1}
                max={500}
                value={draft.durationHours}
                onChange={(e) =>
                  set("durationHours", Number(e.target.value) || 1)
                }
              />
            </Field>
          </div>

          <Field label="Muqova rangi">
            <div className="flex flex-wrap gap-2">
              {ACCENTS.map((accent) => (
                <button
                  key={accent.value}
                  type="button"
                  aria-label={accent.label}
                  aria-pressed={draft.accent === accent.value}
                  onClick={() => set("accent", accent.value)}
                  className={cn(
                    "h-10 w-16 rounded-md bg-gradient-to-br ring-offset-2 ring-offset-background transition-shadow",
                    accent.value,
                    draft.accent === accent.value && "ring-2 ring-ring",
                  )}
                />
              ))}
            </div>
          </Field>

          <Field
            label="Nimalarni o'rganadi"
            hint="Har bir natija alohida qatorda."
          >
            <Textarea
              rows={4}
              value={draft.objectives.join("\n")}
              placeholder={"Semantik HTML yozish\nForma tuzish"}
              onChange={(e) =>
                set(
                  "objectives",
                  e.target.value.split("\n").filter((l) => l.trim() !== ""),
                )
              }
            />
          </Field>

          <Field label="Talablar" hint="Har bir talab alohida qatorda.">
            <Textarea
              rows={3}
              value={draft.prerequisites.join("\n")}
              onChange={(e) =>
                set(
                  "prerequisites",
                  e.target.value.split("\n").filter((l) => l.trim() !== ""),
                )
              }
            />
          </Field>

          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-medium">Modullar</h2>
              <p className="text-xs text-muted-foreground">
                Darslar shu modullar ichiga joylashadi.
              </p>
            </div>

            {modules.map((title, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-6 shrink-0 text-sm text-muted-foreground">
                  {index + 1}.
                </span>
                <Input
                  value={title}
                  placeholder="Modul nomi"
                  onChange={(e) =>
                    set(
                      "moduleTitles",
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
                    set("moduleTitles", next);
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
                    set(
                      "moduleTitles",
                      modules.filter((_, i) => i !== index),
                    )
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
                onClick={() => set("moduleTitles", [...modules, ""])}
              >
                + Modul qo&apos;shish
              </Button>
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ko&apos;rinishi
            </p>
            <Card className="overflow-hidden">
              <div
                className={`flex h-24 items-end bg-gradient-to-br ${draft.accent} p-4`}
              >
                <span className="text-lg font-bold text-white drop-shadow-sm">
                  {draft.title || "Kurs nomi"}
                </span>
              </div>
              <CardContent className="flex flex-col gap-3 p-4">
                <p className="text-sm text-muted-foreground">
                  {draft.subtitle || "Qisqa tavsif"}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{draft.difficulty}</Badge>
                  <span>{modules.filter((m) => m.trim()).length} modul</span>
                  <span aria-hidden>·</span>
                  <span>{draft.durationHours} soat</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {created && (
            <Card>
              <CardContent className="flex flex-col gap-3 p-4">
                <p className="text-sm">
                  Kurs qoralamasi saqlandi. Endi unga dars qo&apos;shishingiz
                  mumkin.
                </p>
                <ButtonLink
                  href={`/contributor/lessons/new?course=${draft.slug}`}
                  size="sm"
                >
                  Dars qo&apos;shish
                </ButtonLink>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>

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
            Kurs ko&apos;rib chiqishga yuborildi.
          </span>
        ) : (
          !canSubmit && (
            <span className="text-sm text-muted-foreground">
              Yuborish uchun {allIssues.length} ta talab bajarilishi kerak
            </span>
          )
        )}
      </div>

      {showIssues && allIssues.length > 0 && (
        <Card className="border-destructive">
          <CardContent className="p-5">
            <h2 className="mb-2 font-semibold">
              Yuborishdan oldin to&apos;ldirilishi kerak
            </h2>
            <ul className="ml-5 flex list-disc flex-col gap-1 text-sm">
              {allIssues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {stored.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">
            Sizning kurs qoralamalaringiz
          </h2>
          <Card>
            <ul className="divide-y divide-border">
              {stored.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {c.title || "Nomsiz kurs"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      /{c.slug} · {c.moduleTitles.length} modul
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{STATUS_LABELS[c.status]}</Badge>
                    <Link
                      href={`/contributor/lessons/new?course=${c.slug}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Dars qo&apos;shish
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}
    </div>
  );
}
