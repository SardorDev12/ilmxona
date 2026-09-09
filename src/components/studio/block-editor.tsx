"use client";

import type { Block } from "@/lib/content/types";
import { BLOCK_LABELS, newBlock } from "@/lib/content/editor";
import { Input, Textarea, Select, Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Props = {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
};

export function BlockEditor({ blocks, onChange }: Props) {
  function update(index: number, block: Block) {
    onChange(blocks.map((b, i) => (i === index ? block : b)));
  }

  function remove(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;

    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-4">
      {blocks.length === 0 && (
        <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          Dars matni hali bo&apos;sh. Quyidan blok qo&apos;shing.
        </p>
      )}

      {blocks.map((block, index) => (
        <div
          key={index}
          className="rounded-lg border border-border bg-card"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
            <Badge variant="outline">{BLOCK_LABELS[block.type]}</Badge>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label="Yuqoriga ko'chirish"
              >
                ↑
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => move(index, 1)}
                disabled={index === blocks.length - 1}
                aria-label="Pastga ko'chirish"
              >
                ↓
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => remove(index)}
                aria-label="O'chirish"
                className="text-destructive"
              >
                ✕
              </Button>
            </div>
          </div>

          <div className="p-3">
            <BlockFields
              block={block}
              onChange={(b) => update(index, b)}
            />
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        {(Object.keys(BLOCK_LABELS) as Block["type"][]).map((type) => (
          <Button
            key={type}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange([...blocks, newBlock(type)])}
          >
            + {BLOCK_LABELS[type]}
          </Button>
        ))}
      </div>
    </div>
  );
}

function BlockFields({
  block,
  onChange,
}: {
  block: Block;
  onChange: (block: Block) => void;
}) {
  switch (block.type) {
    case "heading":
      return (
        <Input
          value={block.text}
          placeholder="Bo'lim sarlavhasi"
          onChange={(e) => onChange({ ...block, text: e.target.value })}
        />
      );

    case "paragraph":
    case "note":
    case "warning":
      return (
        <Textarea
          rows={3}
          value={block.text}
          placeholder={
            block.type === "paragraph"
              ? "Matn..."
              : block.type === "note"
                ? "Eslatma matni..."
                : "Ogohlantirish matni..."
          }
          onChange={(e) => onChange({ ...block, text: e.target.value })}
        />
      );

    case "list":
      return (
        <div className="flex flex-col gap-3">
          <Field label="Bandlar" hint="Har bir band alohida qatorda.">
            <Textarea
              rows={4}
              value={block.items.join("\n")}
              placeholder={"Birinchi band\nIkkinchi band"}
              onChange={(e) =>
                onChange({ ...block, items: e.target.value.split("\n") })
              }
            />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={block.ordered ?? false}
              onChange={(e) =>
                onChange({ ...block, ordered: e.target.checked })
              }
            />
            Raqamlangan ro&apos;yxat
          </label>
        </div>
      );

    case "code":
      return (
        <div className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Til">
              <Select
                value={block.lang}
                onChange={(e) => onChange({ ...block, lang: e.target.value })}
              >
                {["html", "css", "js", "ts", "sql", "bash", "json"].map(
                  (lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ),
                )}
              </Select>
            </Field>
            <Field label="Izoh" hint="Ixtiyoriy.">
              <Input
                value={block.caption ?? ""}
                onChange={(e) =>
                  onChange({ ...block, caption: e.target.value })
                }
              />
            </Field>
          </div>
          <Textarea
            rows={6}
            className="font-mono text-xs"
            value={block.code}
            placeholder="Kod..."
            spellCheck={false}
            onChange={(e) => onChange({ ...block, code: e.target.value })}
          />
        </div>
      );

    case "table":
      return (
        <div className="flex flex-col gap-3">
          <Field label="Ustunlar" hint="Vertikal chiziq bilan ajrating: |">
            <Input
              value={block.headers.join(" | ")}
              placeholder="Teg | Vazifasi"
              onChange={(e) =>
                onChange({
                  ...block,
                  headers: e.target.value.split("|").map((h) => h.trim()),
                })
              }
            />
          </Field>
          <Field
            label="Qatorlar"
            hint="Har bir qator alohida satrda, kataklar | bilan ajratiladi."
          >
            <Textarea
              rows={5}
              className="font-mono text-xs"
              value={block.rows.map((r) => r.join(" | ")).join("\n")}
              placeholder={"header | Sarlavha\nnav | Navigatsiya"}
              onChange={(e) =>
                onChange({
                  ...block,
                  rows: e.target.value
                    .split("\n")
                    .map((row) => row.split("|").map((c) => c.trim())),
                })
              }
            />
          </Field>
        </div>
      );

    case "playground":
      return (
        <div className="flex flex-col gap-3">
          <Field label="HTML">
            <Textarea
              rows={4}
              className="font-mono text-xs"
              spellCheck={false}
              value={block.html ?? ""}
              onChange={(e) => onChange({ ...block, html: e.target.value })}
            />
          </Field>
          <Field label="CSS">
            <Textarea
              rows={4}
              className="font-mono text-xs"
              spellCheck={false}
              value={block.css ?? ""}
              onChange={(e) => onChange({ ...block, css: e.target.value })}
            />
          </Field>
          <Field label="JavaScript">
            <Textarea
              rows={4}
              className="font-mono text-xs"
              spellCheck={false}
              value={block.js ?? ""}
              onChange={(e) => onChange({ ...block, js: e.target.value })}
            />
          </Field>
        </div>
      );
  }
}
