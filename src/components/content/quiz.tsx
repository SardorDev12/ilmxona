"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/content/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function sameSet(a: string[], b: string[]) {
  return a.length === b.length && a.every((x) => b.includes(x));
}

export function Quiz({ questions }: { questions: QuizQuestion[] }) {
  const [picked, setPicked] = useState<Record<string, string[]>>({});
  const [submitted, setSubmitted] = useState(false);

  if (questions.length === 0) return null;

  function toggle(q: QuizQuestion, answerId: string) {
    if (submitted) return;

    setPicked((prev) => {
      const current = prev[q.id] ?? [];

      if (q.type === "multiple") {
        return {
          ...prev,
          [q.id]: current.includes(answerId)
            ? current.filter((id) => id !== answerId)
            : [...current, answerId],
        };
      }

      return { ...prev, [q.id]: [answerId] };
    });
  }

  const score = questions.filter((q) =>
    sameSet(picked[q.id] ?? [], q.correct),
  ).length;

  const answeredAll = questions.every((q) => (picked[q.id] ?? []).length > 0);

  return (
    <div className="flex flex-col gap-6">
      {questions.map((q, i) => {
        const chosen = picked[q.id] ?? [];
        const isRight = sameSet(chosen, q.correct);

        return (
          <div key={q.id} className="flex flex-col gap-3">
            <p className="font-medium">
              <span className="text-muted-foreground">{i + 1}. </span>
              {q.question}
              {q.type === "multiple" && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  (bir nechta javob)
                </span>
              )}
            </p>

            <div className="flex flex-col gap-2">
              {q.answers.map((a) => {
                const isChosen = chosen.includes(a.id);
                const isCorrect = q.correct.includes(a.id);

                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggle(q, a.id)}
                    disabled={submitted}
                    aria-pressed={isChosen}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition-colors disabled:cursor-default",
                      !submitted && "hover:border-primary/60 hover:bg-muted",
                      isChosen && !submitted
                        ? "border-primary bg-primary/5"
                        : "border-border",
                      submitted &&
                        isCorrect &&
                        "border-accent bg-accent/10 text-foreground",
                      submitted &&
                        isChosen &&
                        !isCorrect &&
                        "border-destructive bg-destructive/10",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center border text-[11px] font-semibold",
                        q.type === "multiple" ? "rounded" : "rounded-full",
                        isChosen
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground",
                        submitted &&
                          isCorrect &&
                          "border-accent bg-accent text-accent-foreground",
                      )}
                    >
                      {submitted && isCorrect
                        ? "✓"
                        : isChosen
                          ? "•"
                          : String.fromCharCode(65 + q.answers.indexOf(a))}
                    </span>
                    {a.text}
                  </button>
                );
              })}
            </div>

            {submitted && (
              <p
                className={cn(
                  "rounded-md px-3 py-2 text-sm",
                  isRight
                    ? "bg-accent/10 text-foreground"
                    : "bg-destructive/10 text-foreground",
                )}
              >
                <strong>{isRight ? "To'g'ri. " : "Noto'g'ri. "}</strong>
                {q.explanation}
              </p>
            )}
          </div>
        );
      })}

      <div className="flex flex-wrap items-center gap-3">
        {!submitted ? (
          <Button
            type="button"
            onClick={() => setSubmitted(true)}
            disabled={!answeredAll}
          >
            Javoblarni tekshirish
          </Button>
        ) : (
          <>
            <p className="text-sm font-medium">
              Natija: {score} / {questions.length}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setPicked({});
                setSubmitted(false);
              }}
            >
              Qayta urinish
            </Button>
          </>
        )}

        {!submitted && !answeredAll && (
          <span className="text-xs text-muted-foreground">
            Barcha savollarga javob bering
          </span>
        )}
      </div>
    </div>
  );
}
