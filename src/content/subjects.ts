import { courses } from "./index";

export type Subject = {
  name: string;
  description: string;
  /** Courses published so far. Zero means the subject is still planned. */
  courseCount: number;
};

/**
 * Subject areas the platform covers. Programming is where the content
 * starts; the rest are the expansion order from docs/PRD.md §43. Counts
 * come from the published courses, so a subject goes live simply by
 * having a course filed under it.
 */
const PLANNED = [
  { name: "Dasturlash", description: "Veb, ma'lumotlar bazasi va asboblar" },
  { name: "Biznes", description: "Boshqaruv, marketing, tadbirkorlik" },
  { name: "Moliya", description: "Shaxsiy moliya va buxgalteriya" },
  { name: "Ingliz tili", description: "Grammatika va so'zlashuv" },
  { name: "Matematika", description: "Maktab va oliy matematika" },
  { name: "Tabiiy fanlar", description: "Fizika, kimyo, biologiya" },
  { name: "Dizayn", description: "Grafik dizayn va UI" },
  { name: "Kasbiy ko'nikmalar", description: "Muloqot, vaqt boshqaruvi" },
];

export const subjects: Subject[] = PLANNED.map((subject) => ({
  ...subject,
  courseCount: courses.filter((c) => c.category === subject.name).length,
}));
