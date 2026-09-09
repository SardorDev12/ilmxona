import type { Block, Exercise, QuizQuestion } from "./types";

/**
 * Helpers shared by the authoring UI. Kept apart from queries.ts, which
 * is server-only: these run in the browser inside the editors.
 */

export function newBlock(type: Block["type"]): Block {
  switch (type) {
    case "heading":
      return { type: "heading", text: "" };
    case "paragraph":
      return { type: "paragraph", text: "" };
    case "list":
      return { type: "list", items: [""] };
    case "code":
      return { type: "code", lang: "js", code: "" };
    case "note":
      return { type: "note", text: "" };
    case "warning":
      return { type: "warning", text: "" };
    case "table":
      return { type: "table", headers: ["", ""], rows: [["", ""]] };
    case "playground":
      return { type: "playground", html: "", css: "", js: "" };
  }
}

export const BLOCK_LABELS: Record<Block["type"], string> = {
  heading: "Sarlavha",
  paragraph: "Matn",
  list: "Ro'yxat",
  code: "Kod",
  note: "Eslatma",
  warning: "Ogohlantirish",
  table: "Jadval",
  playground: "Interaktiv misol",
};

export function newQuestion(): QuizQuestion {
  return {
    id: `q${Date.now()}`,
    question: "",
    type: "single",
    answers: [
      { id: "a", text: "" },
      { id: "b", text: "" },
    ],
    correct: [],
    explanation: "",
  };
}

export const EMPTY_EXERCISE: Exercise = {
  title: "",
  instructions: "",
  starterCode: "",
  solution: "",
  hints: [""],
};
