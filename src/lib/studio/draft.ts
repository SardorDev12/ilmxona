import type { Block, Exercise, QuizQuestion } from "@/content/types";
import { createLocalStore } from "./store";

/** Content workflow states from docs/PRD.md §23. */
export type DraftStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "CHANGES_REQUESTED"
  | "APPROVED"
  | "PUBLISHED";

export const STATUS_LABELS: Record<DraftStatus, string> = {
  DRAFT: "Qoralama",
  SUBMITTED: "Yuborilgan",
  UNDER_REVIEW: "Ko'rib chiqilmoqda",
  CHANGES_REQUESTED: "O'zgartirish so'ralgan",
  APPROVED: "Tasdiqlangan",
  PUBLISHED: "Nashr etilgan",
};

export type LessonDraft = {
  status: DraftStatus;
  courseSlug: string;
  moduleTitle: string;
  title: string;
  slug: string;
  intro: string;
  whyImportant: string;
  durationMin: number;
  body: Block[];
  commonMistakes: string[];
  exercise: Exercise | null;
  quiz: QuizQuestion[];
  relatedTerms: string[];
};

export const EMPTY_DRAFT: LessonDraft = {
  status: "DRAFT",
  courseSlug: "",
  moduleTitle: "",
  title: "",
  slug: "",
  intro: "",
  whyImportant: "",
  durationMin: 10,
  body: [],
  commonMistakes: [],
  exercise: null,
  quiz: [],
  relatedTerms: [],
};

/**
 * Uzbek Latin text uses several apostrophe characters (oʻ, o', o') that
 * carry meaning but don't belong in a URL. Drop them rather than turning
 * them into separators, so "mo'ljal" becomes "moljal", not "mo-ljal".
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[ʻʼ‘’'`´]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

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

/**
 * What still has to be filled in before the draft can go to review.
 * Returned as messages so the editor can show them inline.
 */
export function validationIssues(draft: LessonDraft): string[] {
  const issues: string[] = [];

  if (!draft.title.trim()) issues.push("Dars sarlavhasi kiritilmagan.");
  if (!draft.slug.trim()) issues.push("URL manzili (slug) bo'sh.");
  if (!draft.courseSlug) issues.push("Kurs tanlanmagan.");
  if (!draft.intro.trim()) issues.push("Qisqa tavsif kiritilmagan.");
  if (draft.body.length === 0)
    issues.push("Dars matni bo'sh — kamida bitta blok qo'shing.");
  if (draft.quiz.length === 0)
    issues.push("Test savollari yo'q — kamida bitta savol qo'shing.");

  draft.quiz.forEach((q, i) => {
    if (!q.question.trim())
      issues.push(`${i + 1}-savol matni kiritilmagan.`);
    if (q.correct.length === 0)
      issues.push(`${i + 1}-savolda to'g'ri javob belgilanmagan.`);
  });

  return issues;
}

const STORAGE_KEY = "ilmxona:lesson-draft";

const lessonStore = createLocalStore<LessonDraft | null>(
  STORAGE_KEY,
  null,
  (parsed) => ({ ...EMPTY_DRAFT, ...(parsed as LessonDraft) }),
);

export const getStoredDraft = lessonStore.read;
export const getServerDraft = lessonStore.readServer;
export const subscribeToStoredDraft = lessonStore.subscribe;
export const saveDraft = lessonStore.write;
export const clearDraft = lessonStore.clear;
