import type { LearningPath } from "./types";

export const learningPaths: LearningPath[] = [
  {
    slug: "frontend-dasturchi",
    title: "Frontend dasturchi",
    description:
      "Noldan boshlab brauzerda ishlaydigan interfeyslar yozishni o'rganing. Yo'nalish HTML'dan boshlanadi va zamonaviy asboblar bilan yakunlanadi.",
    difficulty: "Boshlang'ich",
    durationMonths: 6,
    courseSlugs: ["html", "css", "javascript", "git"],
    outcomes: [
      "Moslashuvchan, mobil qurilmalarga mos sahifalar yozish",
      "JavaScript bilan interaktiv interfeys qurish",
      "Jamoada Git orqali ishlash",
      "Portfolio uchun bir nechta loyiha tayyorlash",
    ],
    skills: ["HTML", "CSS", "JavaScript", "Git", "Accessibility"],
  },
  {
    slug: "backend-dasturchi",
    title: "Backend dasturchi",
    description:
      "Server tomonidagi mantiq va ma'lumotlar bazasi bilan ishlash. Ma'lumotni to'g'ri saqlash va tez olishni o'rganing.",
    difficulty: "O'rta",
    durationMonths: 7,
    courseSlugs: ["javascript", "sql", "git"],
    outcomes: [
      "Relyatsion ma'lumotlar bazasini loyihalash",
      "Samarali SQL so'rovlari yozish",
      "API qurish va himoyalash",
    ],
    skills: ["JavaScript", "SQL", "PostgreSQL", "Git", "API"],
  },
  {
    slug: "veb-asoslari",
    title: "Veb asoslari",
    description:
      "Dasturlashga endi kirishayotganlar uchun eng qisqa yo'l. Uch kursda vebning qanday ishlashini tushunasiz.",
    difficulty: "Boshlang'ich",
    durationMonths: 3,
    courseSlugs: ["html", "css", "git"],
    outcomes: [
      "O'z saytingizni yozib, internetga joylash",
      "Kod tarixi bilan ishlash",
      "Keyingi yo'nalishni ongli tanlash",
    ],
    skills: ["HTML", "CSS", "Git"],
  },
];

export function getLearningPath(slug: string) {
  return learningPaths.find((p) => p.slug === slug);
}
