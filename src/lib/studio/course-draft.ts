import type { Difficulty } from "@/content/types";
import { createLocalStore } from "./store";
import type { DraftStatus } from "./draft";

export type CourseDraft = {
  id: string;
  status: DraftStatus;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  durationHours: number;
  accent: string;
  objectives: string[];
  prerequisites: string[];
  moduleTitles: string[];
};

export const DIFFICULTIES: Difficulty[] = [
  "Boshlang'ich",
  "O'rta",
  "Yuqori",
];

/** Cover gradients, matching the ones the published courses use. */
export const ACCENTS = [
  { value: "from-sky-500 to-blue-600", label: "Ko'k" },
  { value: "from-emerald-500 to-teal-600", label: "Yashil" },
  { value: "from-orange-500 to-amber-500", label: "To'q sariq" },
  { value: "from-yellow-400 to-amber-500", label: "Sariq" },
  { value: "from-rose-500 to-red-600", label: "Qizil" },
  { value: "from-violet-500 to-purple-600", label: "Binafsha" },
];

export const CATEGORIES = [
  "Dasturlash",
  "Biznes",
  "Moliya",
  "Ingliz tili",
  "Matematika",
  "Dizayn",
];

export function emptyCourseDraft(): CourseDraft {
  return {
    id: `course-${Date.now()}`,
    status: "DRAFT",
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    category: CATEGORIES[0],
    difficulty: "Boshlang'ich",
    durationHours: 10,
    accent: ACCENTS[0].value,
    objectives: [],
    prerequisites: [],
    moduleTitles: ["Boshlanish"],
  };
}

export function courseValidationIssues(draft: CourseDraft): string[] {
  const issues: string[] = [];

  if (!draft.title.trim()) issues.push("Kurs nomi kiritilmagan.");
  if (!draft.slug.trim()) issues.push("URL manzili (slug) bo'sh.");
  if (!draft.subtitle.trim())
    issues.push("Qisqa tavsif (subtitle) kiritilmagan.");
  if (!draft.description.trim()) issues.push("Kurs tavsifi kiritilmagan.");
  if (draft.objectives.length === 0)
    issues.push("Kamida bitta o'quv natijasi ko'rsatilishi kerak.");
  if (draft.moduleTitles.filter((m) => m.trim()).length === 0)
    issues.push("Kamida bitta modul bo'lishi kerak.");

  return issues;
}

const courseStore = createLocalStore<CourseDraft[]>(
  "ilmxona:course-drafts",
  [],
  (parsed) => (Array.isArray(parsed) ? (parsed as CourseDraft[]) : []),
);

export const getStoredCourseDrafts = courseStore.read;
export const getServerCourseDrafts = courseStore.readServer;
export const subscribeToCourseDrafts = courseStore.subscribe;

/** Inserts or replaces a draft by id, newest last. */
export function saveCourseDraft(draft: CourseDraft): boolean {
  const existing = courseStore.read();
  const next = existing.some((c) => c.id === draft.id)
    ? existing.map((c) => (c.id === draft.id ? draft : c))
    : [...existing, draft];

  return courseStore.write(next);
}

export function deleteCourseDraft(id: string): boolean {
  return courseStore.write(courseStore.read().filter((c) => c.id !== id));
}
