"use client";

import { useState } from "react";
import type { Exercise } from "@/content/types";
import { Button } from "@/components/ui/button";

export function ExerciseBlock({ exercise }: { exercise: Exercise }) {
  const [code, setCode] = useState(exercise.starterCode);
  const [shownHints, setShownHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{exercise.instructions}</p>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        aria-label="Mashq kodi"
        className="min-h-44 resize-y rounded-lg border border-border bg-background p-3 font-mono text-xs leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      <div className="flex flex-wrap gap-2">
        {shownHints < exercise.hints.length && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShownHints((n) => n + 1)}
          >
            Maslahat ({shownHints + 1}/{exercise.hints.length})
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowSolution((s) => !s)}
        >
          {showSolution ? "Yechimni yashirish" : "Yechimni ko'rsatish"}
        </Button>
      </div>

      {shownHints > 0 && (
        <ul className="flex flex-col gap-2">
          {exercise.hints.slice(0, shownHints).map((hint, i) => (
            <li
              key={hint}
              className="rounded-md border-l-2 border-primary bg-muted px-3 py-2 text-sm"
            >
              <span className="text-muted-foreground">Maslahat {i + 1}: </span>
              {hint}
            </li>
          ))}
        </ul>
      )}

      {showSolution && (
        <pre className="overflow-x-auto rounded-lg border border-border bg-muted p-4 text-xs leading-relaxed">
          <code>{exercise.solution}</code>
        </pre>
      )}
    </div>
  );
}
