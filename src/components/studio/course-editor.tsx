"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  ACCENTS,
  CATEGORIES,
  DIFFICULTIES,
  slugify,
} from "@/lib/content/types";
import { createCourse, type ContentFormState } from "@/lib/content/mutations";
import { Input, Textarea, Select, Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Course form. Everything is a plain form field so the browser keeps the
 * values on a failed submit; the pieces held in React state are the ones
 * the preview and the slug suggestion need to read as you type.
 */
export function CourseEditor() {
  const [state, action] = useActionState<ContentFormState, FormData>(
    createCourse,
    {},
  );

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[0]);
  const [hours, setHours] = useState(10);
  const [accent, setAccent] = useState(ACCENTS[0].value);
  const [modules, setModules] = useState<string[]>([""]);

  return (
    <form action={action} className="flex flex-col gap-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex flex-col gap-5">
          <Field label="Kurs nomi" htmlFor="title">
            <Input
              id="title"
              name="title"
              required
              value={title}
              placeholder="Masalan: Moliyaviy savodxonlik"
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugEdited) setSlug(slugify(e.target.value));
              }}
            />
          </Field>

          <Field
            label="URL manzili"
            htmlFor="slug"
            hint={`/courses/${slug || "..."}`}
          >
            <Input
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugEdited(true);
                setSlug(slugify(e.target.value));
              }}
            />
          </Field>

          <Field
            label="Qisqa tavsif"
            htmlFor="subtitle"
            hint="Kurs kartochkasida sarlavha ostida ko'rinadi."
          >
            <Input
              id="subtitle"
              name="subtitle"
              value={subtitle}
              placeholder="Bir jumlada kurs nima haqida"
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </Field>

          <Field label="To'liq tavsif" htmlFor="description">
            <Textarea id="description" name="description" rows={4} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Kategoriya" htmlFor="category">
              <Select id="category" name="category" defaultValue={CATEGORIES[0]}>
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

          <Field label="Muqova rangi">
            <input type="hidden" name="accent" value={accent} />
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

          <Field
            label="Nimalarni o'rganadi"
            htmlFor="objectives"
            hint="Har bir natija alohida qatorda."
          >
            <Textarea
              id="objectives"
              name="objectives"
              rows={4}
              placeholder={"Oylik byudjet tuzish\nJamg'armani rejalashtirish"}
            />
          </Field>

          <Field
            label="Talablar"
            htmlFor="prerequisites"
            hint="Har bir talab alohida qatorda."
          >
            <Textarea id="prerequisites" name="prerequisites" rows={3} />
          </Field>

          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-medium">Modullar</h2>
              <p className="text-xs text-muted-foreground">
                Darslar shu modullar ichiga joylashadi. Bo&apos;sh qoldirsangiz
                darslar bevosita kursga qo&apos;shiladi.
              </p>
            </div>

            {/* The action reads modules as one newline-separated field. */}
            <input
              type="hidden"
              name="modules"
              value={modules.filter((m) => m.trim()).join("\n")}
            />

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

        <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
          <div>
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
                  {subtitle || "Qisqa tavsif"}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{difficulty}</Badge>
                  <span>
                    {modules.filter((m) => m.trim()).length} modul
                  </span>
                  <span aria-hidden>·</span>
                  <span>{hours} soat</span>
                </div>
              </CardContent>
            </Card>
          </div>
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
        <SubmitButton />
        <span className="text-sm text-muted-foreground">
          Kurs qoralama sifatida saqlanadi. Darslarni qo&apos;shib
          bo&apos;lgach, ko&apos;rib chiqishga yuborasiz.
        </span>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saqlanmoqda…" : "Kursni yaratish"}
    </Button>
  );
}
