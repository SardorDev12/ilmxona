import type { Contributor } from "./types";

export const contributors: Contributor[] = [
  {
    username: "avaliyev",
    name: "Ali Valiyev",
    title: "Frontend dasturchi",
    bio: "Olti yildan beri veb-ilovalar ishlab chiqaman. Toshkentdagi bir nechta bootcamp'da JavaScript va React bo'yicha dars beraman. O'zbek tilida sifatli texnik kontent yetishmasligi meni Ilmxonaga olib keldi.",
    expertise: ["JavaScript", "React", "CSS"],
    learners: 12450,
  },
  {
    username: "dsattorova",
    name: "Dilnoza Sattorova",
    title: "Backend muhandisi",
    bio: "Ma'lumotlar bazalari va API arxitekturasi bilan ishlayman. PostgreSQL bo'yicha ichki treninglar olib boraman.",
    expertise: ["SQL", "PostgreSQL", "Node.js"],
    learners: 8320,
  },
  {
    username: "brahimov",
    name: "Bekzod Rahimov",
    title: "DevOps muhandisi",
    bio: "Jamoalarga Git va CI/CD jarayonlarini to'g'ri qurishda yordam beraman. Ochiq kodli loyihalarga hissa qo'shaman.",
    expertise: ["Git", "Docker", "CI/CD"],
    learners: 6180,
  },
  {
    username: "mkarimova",
    name: "Malika Karimova",
    title: "UI dizayner va frontend dasturchi",
    bio: "Dizayn va kod o'rtasidagi ko'prik. Foydalanuvchi interfeysi, tipografika va qulaylik (accessibility) mavzularida yozaman.",
    expertise: ["HTML", "CSS", "Accessibility"],
    learners: 5470,
  },
];

export function getContributor(username: string): Contributor | undefined {
  return contributors.find((c) => c.username === username);
}
