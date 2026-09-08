export type Difficulty = "Boshlang'ich" | "O'rta" | "Yuqori";

export type Contributor = {
  username: string;
  name: string;
  title: string;
  bio: string;
  expertise: string[];
  learners: number;
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
  /** "multiple" allows more than one correct answer. */
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

export type Lesson = {
  slug: string;
  title: string;
  intro: string;
  whyImportant: string;
  body: Block[];
  commonMistakes: string[];
  exercise?: Exercise;
  quiz: QuizQuestion[];
  relatedTerms: string[];
  durationMin: number;
  updatedAt: string;
  authorUsername: string;
  reviewerUsername: string;
};

export type CourseModule = {
  title: string;
  lessons: Lesson[];
};

export type Course = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  durationHours: number;
  /** Tailwind gradient classes for the cover block. */
  accent: string;
  objectives: string[];
  prerequisites: string[];
  modules: CourseModule[];
  authorUsername: string;
  reviewerUsername: string;
  learners: number;
};

export type LearningPath = {
  slug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  durationMonths: number;
  courseSlugs: string[];
  outcomes: string[];
  skills: string[];
};

export type GlossaryTerm = {
  slug: string;
  term: string;
  en: string;
  ru?: string;
  definition: string;
  example?: string;
  related: string[];
};
