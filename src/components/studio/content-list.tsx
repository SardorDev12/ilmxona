"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  submitForReview,
  type ContentFormState,
} from "@/lib/content/mutations";
import { STATUS_LABELS, type ContentStatus } from "@/lib/content/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type ContentRow = {
  id: string;
  title: string;
  href: string;
  meta: string;
  status: ContentStatus;
  reviewNote: string | null;
  table: "courses" | "lessons";
};

/** The author's own courses and lessons, each with its next action. */
export function ContentList({ rows }: { rows: ContentRow[] }) {
  const [state, action] = useActionState<ContentFormState, FormData>(
    submitForReview,
    {},
  );

  return (
    <div className="flex flex-col gap-3">
      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      {state.ok && <p className="text-sm text-accent">{state.ok}</p>}

      <Card>
        <ul className="divide-y divide-border">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
            >
              <div className="min-w-0">
                <Link
                  href={row.href}
                  className="text-sm font-medium hover:text-primary"
                >
                  {row.title}
                </Link>
                <p className="text-xs text-muted-foreground">{row.meta}</p>
                {row.reviewNote && (
                  <p className="mt-1 max-w-lg text-xs text-destructive">
                    Moderator izohi: {row.reviewNote}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant={row.status === "PUBLISHED" ? "primary" : "outline"}
                >
                  {STATUS_LABELS[row.status]}
                </Badge>

                {(row.status === "DRAFT" ||
                  row.status === "CHANGES_REQUESTED") && (
                  <form action={action}>
                    <input type="hidden" name="table" value={row.table} />
                    <input type="hidden" name="id" value={row.id} />
                    <SubmitButton />
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

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="sm" variant="outline" disabled={pending}>
      {pending ? "Yuborilmoqda…" : "Ko'rib chiqishga yuborish"}
    </Button>
  );
}
