/** Content types, mirroring the tables in supabase/sql/006_content.sql. */

export type ContentStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "CHANGES_REQUESTED"
  | "PUBLISHED";

export const STATUS_LABELS: Record<ContentStatus, string> = {
  DRAFT: "Qoralama",
  SUBMITTED: "Ko'rib chiqilmoqda",
  CHANGES_REQUESTED: "O'zgartirish so'ralgan",
  PUBLISHED: "Nashr etilgan",
};

/** Blocks a lesson body is composed of (docs/PRD.md §14). */
export type Block =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "code"; lang: string; code: string; caption?: string }
  | { type: "note"; text: string }
  | { type: "warning"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "playground"; html?: string; css?: string; js?: string };

export type QuizQuestion = {
  id: string;
  question: string;
  type: "single" | "multiple" | "boolean";
  answers: { id: string; text: string }[];
  correct: string[];
  explanation: string;
};

export type Exercise = {
  title: string;
  instructions: string;
  starterCode: string;
  solution: string;
  hints: string[];
};

export type Author = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

export type Module = {
  id: string;
  title: string;
  position: number;
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  difficulty: string;
  duration_hours: number;
  accent: string;
  objectives: string[];
  prerequisites: string[];
  status: ContentStatus;
  review_note: string | null;
  author_id: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type Lesson = {
  id: string;
  course_id: string;
  module_id: string | null;
  slug: string;
  title: string;
  intro: string;
  why_important: string;
  body: Block[];
  common_mistakes: string[];
  exercise: Exercise | null;
  quiz: QuizQuestion[];
  related_terms: string[];
  duration_min: number;
  position: number;
  status: ContentStatus;
  review_note: string | null;
  author_id: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type GlossaryTerm = {
  id: string;
  slug: string;
  term: string;
  en: string;
  ru: string | null;
  definition: string;
  example: string | null;
  related: string[];
  status: ContentStatus;
};

export type LearningPath = {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  duration_months: number;
  outcomes: string[];
  skills: string[];
  status: ContentStatus;
};

export const DIFFICULTIES = ["Boshlang'ich", "O'rta", "Yuqori"];

export const CATEGORIES = [
  "Dasturlash",
  "Biznes",
  "Moliya",
  "Ingliz tili",
  "Matematika",
  "Tabiiy fanlar",
  "Dizayn",
  "Kasbiy ko'nikmalar",
];

/** Cover gradients offered in the course editor. */
export const ACCENTS = [
  { value: "from-sky-500 to-blue-600", label: "Ko'k" },
  { value: "from-emerald-500 to-teal-600", label: "Yashil" },
  { value: "from-orange-500 to-amber-500", label: "To'q sariq" },
  { value: "from-yellow-400 to-amber-500", label: "Sariq" },
  { value: "from-rose-500 to-red-600", label: "Qizil" },
  { value: "from-violet-500 to-purple-600", label: "Binafsha" },
];

/**
 * Uzbek Latin uses several apostrophe characters interchangeably (oʻ, o‘,
 * o'), and people often type none at all. Strip them all so "o'zbek",
 * "oʻzbek" and "ozbek" collapse to the same key (docs/PRD.md §20).
 */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[ʻʼ‘’'`´]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Usernames and content slugs appear in URLs, so apostrophes are dropped
 *  rather than turned into separators: "Ma'lumot" -> "malumot". */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[ʻʼ‘’'`´]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
