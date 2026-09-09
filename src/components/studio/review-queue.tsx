"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { reviewContent, type ContentFormState } from "@/lib/content/mutations";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

export type ReviewItem = {
  id: string;
  table: "courses" | "lessons";
  kind: string;
  title: string;
  href: string;
  author: string;
  submittedAt: string;
};

export function ReviewQueue({ items }: { items: ReviewItem[] }) {
  const [state, action] = useActionState<ContentFormState, FormData>(
    reviewContent,
    {},
  );

  return (
    <div className="flex flex-col gap-4">
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.ok && <p className="text-sm text-accent">{state.ok}</p>}

      {items.map((item) => (
        <ReviewCard key={`${item.table}-${item.id}`} item={item} action={action} />
      ))}
    </div>
  );
}

function ReviewCard({
  item,
  action,
}: {
  item: ReviewItem;
  action: (formData: FormData) => void;
}) {
  // The note only matters for a rejection, so it stays out of the way
  // until the moderator asks for changes.
  const [askingChanges, setAskingChanges] = useState(false);

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link
              href={item.href}
              className="font-medium hover:text-primary"
              target="_blank"
            >
              {item.title}
            </Link>
            <p className="text-xs text-muted-foreground">
              @{item.author} · {new Date(item.submittedAt).toLocaleDateString("uz")}
            </p>
          </div>
          <Badge variant="outline">{item.kind}</Badge>
        </div>

        <form action={action} className="flex flex-col gap-3">
          <input type="hidden" name="table" value={item.table} />
          <input type="hidden" name="id" value={item.id} />

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
                <DecisionButton value="changes" label="O'zgartirish so'rash" />
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
                <DecisionButton value="publish" label="Tasdiqlash va nashr etish" />
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

function DecisionButton({ value, label }: { value: string; label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      name="decision"
      value={value}
      size="sm"
      disabled={pending}
    >
      {pending ? "Bajarilmoqda…" : label}
    </Button>
  );
}
