"use client";

import type { QuizQuestion } from "@/lib/content/types";
import { newQuestion } from "@/lib/content/editor";
import { Input, Textarea, Select, Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  quiz: QuizQuestion[];
  onChange: (quiz: QuizQuestion[]) => void;
};

const TYPE_LABELS: Record<QuizQuestion["type"], string> = {
  single: "Bitta to'g'ri javob",
  multiple: "Bir nechta to'g'ri javob",
  boolean: "To'g'ri / Noto'g'ri",
};

export function QuizEditor({ quiz, onChange }: Props) {
  function update(index: number, question: QuizQuestion) {
    onChange(quiz.map((q, i) => (i === index ? question : q)));
  }

  return (
    <div className="flex flex-col gap-4">
      {quiz.length === 0 && (
        <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          Hali savol yo&apos;q. Har bir dars kamida bitta savol bilan
          yakunlanishi kerak.
        </p>
      )}

      {quiz.map((question, index) => (
        <QuestionFields
          key={question.id}
          index={index}
          question={question}
          onChange={(q) => update(index, q)}
          onRemove={() => onChange(quiz.filter((_, i) => i !== index))}
        />
      ))}

      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...quiz, newQuestion()])}
        >
          + Savol qo&apos;shish
        </Button>
      </div>
    </div>
  );
}

function QuestionFields({
  index,
  question,
  onChange,
  onRemove,
}: {
  index: number;
  question: QuizQuestion;
  onChange: (q: QuizQuestion) => void;
  onRemove: () => void;
}) {
  function setType(type: QuizQuestion["type"]) {
    if (type === "boolean") {
      onChange({
        ...question,
        type,
        answers: [
          { id: "a", text: "To'g'ri" },
          { id: "b", text: "Noto'g'ri" },
        ],
        correct: [],
      });
      return;
    }

    // Switching away from multiple can leave several answers marked; keep
    // only the first so the question stays answerable.
    onChange({
      ...question,
      type,
      correct: type === "single" ? question.correct.slice(0, 1) : question.correct,
    });
  }

  function toggleCorrect(answerId: string) {
    if (question.type === "multiple") {
      onChange({
        ...question,
        correct: question.correct.includes(answerId)
          ? question.correct.filter((id) => id !== answerId)
          : [...question.correct, answerId],
      });
      return;
    }

    onChange({ ...question, correct: [answerId] });
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-sm font-medium">{index + 1}-savol</span>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="text-destructive"
          onClick={onRemove}
          aria-label="Savolni o'chirish"
        >
          ✕
        </Button>
      </div>

      <div className="flex flex-col gap-3 p-3">
        <Field label="Savol">
          <Textarea
            rows={2}
            value={question.question}
            onChange={(e) =>
              onChange({ ...question, question: e.target.value })
            }
          />
        </Field>

        <Field label="Savol turi">
          <Select
            value={question.type}
            onChange={(e) =>
              setType(e.target.value as QuizQuestion["type"])
            }
          >
            {(
              Object.keys(TYPE_LABELS) as QuizQuestion["type"][]
            ).map((type) => (
              <option key={type} value={type}>
                {TYPE_LABELS[type]}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Javoblar"
          hint="To'g'ri javob(lar)ni chap tomondagi belgi bilan tanlang."
        >
          <div className="flex flex-col gap-2">
            {question.answers.map((answer) => (
              <div key={answer.id} className="flex items-center gap-2">
                <input
                  type={question.type === "multiple" ? "checkbox" : "radio"}
                  name={`correct-${question.id}`}
                  checked={question.correct.includes(answer.id)}
                  onChange={() => toggleCorrect(answer.id)}
                  aria-label={`${answer.id} javobini to'g'ri deb belgilash`}
                />
                <Input
                  value={answer.text}
                  disabled={question.type === "boolean"}
                  onChange={(e) =>
                    onChange({
                      ...question,
                      answers: question.answers.map((a) =>
                        a.id === answer.id
                          ? { ...a, text: e.target.value }
                          : a,
                      ),
                    })
                  }
                />
                {question.type !== "boolean" &&
                  question.answers.length > 2 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      aria-label="Javobni o'chirish"
                      onClick={() =>
                        onChange({
                          ...question,
                          answers: question.answers.filter(
                            (a) => a.id !== answer.id,
                          ),
                          correct: question.correct.filter(
                            (id) => id !== answer.id,
                          ),
                        })
                      }
                    >
                      ✕
                    </Button>
                  )}
              </div>
            ))}
          </div>
        </Field>

        {question.type !== "boolean" && (
          <div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() =>
                onChange({
                  ...question,
                  answers: [
                    ...question.answers,
                    {
                      id: String.fromCharCode(97 + question.answers.length),
                      text: "",
                    },
                  ],
                })
              }
            >
              + Javob qo&apos;shish
            </Button>
          </div>
        )}

        <Field
          label="Izoh"
          hint="Javob tekshirilgandan keyin ko'rsatiladi — nima uchun shunday ekanini tushuntiring."
        >
          <Textarea
            rows={2}
            value={question.explanation}
            onChange={(e) =>
              onChange({ ...question, explanation: e.target.value })
            }
          />
        </Field>
      </div>
    </div>
  );
}
