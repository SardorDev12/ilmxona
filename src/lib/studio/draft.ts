import type { Block, Exercise, QuizQuestion } from "@/content/types";

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

/**
 * Drafts live in the browser until the content backend exists. Reads and
 * writes are guarded: storage throws in private mode and some embedded
 * browsers, and a half-written value shouldn't take the editor down.
 */
// useSyncExternalStore calls getSnapshot on every render and compares by
// reference, so the parsed draft is cached against the raw string it came
// from — re-parsing would hand back a new object each time and loop.
let cachedRaw: string | null = null;
let cachedDraft: LessonDraft | null = null;

/** Snapshot of the stored draft. Stable reference until storage changes. */
export function getStoredDraft(): LessonDraft | null {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }

  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedDraft = raw
        ? { ...EMPTY_DRAFT, ...(JSON.parse(raw) as LessonDraft) }
        : null;
    } catch {
      cachedDraft = null;
    }
  }

  return cachedDraft;
}

/** Server render has no localStorage, so it starts from nothing. */
export function getServerDraft(): LessonDraft | null {
  return null;
}

/** Picks up a draft saved by the same author in another tab. */
export function subscribeToStoredDraft(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export function saveDraft(draft: LessonDraft): boolean {
  try {
    const raw = JSON.stringify(draft);
    window.localStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedDraft = draft;
    return true;
  } catch {
    return false;
  }
}

export function clearDraft() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    cachedRaw = null;
    cachedDraft = null;
  } catch {
    // Nothing to do — the draft simply stays where it is.
  }
}
