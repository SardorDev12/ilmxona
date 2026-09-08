import type { GlossaryTerm } from "./types";

export const glossary: GlossaryTerm[] = [
  {
    slug: "api",
    term: "API",
    en: "Application Programming Interface",
    ru: "API / программный интерфейс",
    definition:
      "API — dasturlar o'rtasida ma'lumot almashishni ta'minlaydigan interfeys. U bir dastur boshqasidan nimani so'rashi mumkinligini va javob qanday ko'rinishda kelishini belgilaydi.",
    example:
      "Ob-havo ilovasi ma'lumotni to'g'ridan-to'g'ri hisoblamaydi — u meteorologik xizmatning API'siga so'rov yuboradi.",
    related: ["http", "json", "rest"],
  },
  {
    slug: "http",
    term: "HTTP",
    en: "HyperText Transfer Protocol",
    ru: "HTTP / протокол передачи",
    definition:
      "Brauzer va server o'rtasidagi muloqot qoidalari to'plami. Har bir so'rov metod (GET, POST), manzil va sarlavhalardan iborat bo'ladi.",
    example: "GET /kurslar so'rovi serverdan kurslar ro'yxatini so'raydi.",
    related: ["api", "rest"],
  },
  {
    slug: "json",
    term: "JSON",
    en: "JavaScript Object Notation",
    ru: "JSON / формат обмена данными",
    definition:
      "Ma'lumotni matn ko'rinishida yozish formati. Odam ham o'qiy oladi, dastur ham osongina qayta ishlaydi.",
    example: '{ "ism": "Aziz", "yosh": 25, "faol": true }',
    related: ["api", "javascript"],
  },
  {
    slug: "rest",
    term: "REST",
    en: "Representational State Transfer",
    definition:
      "API qurishning keng tarqalgan uslubi. Har bir resurs o'z manziliga ega bo'ladi va u ustidagi amallar HTTP metodlari bilan ifodalanadi.",
    example:
      "GET /kurslar — ro'yxat, POST /kurslar — yangi kurs, DELETE /kurslar/5 — o'chirish.",
    related: ["api", "http"],
  },
  {
    slug: "dom",
    term: "DOM",
    en: "Document Object Model",
    ru: "DOM / объектная модель документа",
    definition:
      "Brauzer HTML hujjatdan quradigan daraxtsimon tuzilma. JavaScript sahifani aynan shu daraxt orqali o'zgartiradi.",
    example:
      "document.querySelector(\"h1\") DOM daraxtidan birinchi h1 elementini topib beradi.",
    related: ["html", "javascript"],
  },
  {
    slug: "html",
    term: "HTML",
    en: "HyperText Markup Language",
    ru: "HTML / язык разметки",
    definition:
      "Veb-sahifaning tuzilishini belgilaydigan belgilash tili. U sahifada nima borligini aytadi, qanday ko'rinishini emas.",
    related: ["css", "dom", "accessibility"],
  },
  {
    slug: "css",
    term: "CSS",
    en: "Cascading Style Sheets",
    ru: "CSS / каскадные таблицы стилей",
    definition:
      "HTML elementlarining ko'rinishini — rang, o'lcham, joylashuv va animatsiyasini belgilaydigan til.",
    related: ["html", "responsive-dizayn"],
  },
  {
    slug: "javascript",
    term: "JavaScript",
    en: "JavaScript",
    definition:
      "Brauzerda ishlaydigan dasturlash tili. Sahifani interaktiv qiladi: tugmaga javob beradi, ma'lumot yuklaydi, kontentni o'zgartiradi.",
    related: ["dom", "json", "api"],
  },
  {
    slug: "responsive-dizayn",
    term: "Moslashuvchan dizayn",
    en: "Responsive design",
    ru: "Адаптивный дизайн",
    definition:
      "Sahifaning ekran o'lchamiga qarab o'z joylashuvini o'zgartirishi. Bitta sayt telefonda ham, kompyuterda ham qulay ko'rinadi.",
    example:
      "Kompyuterda uch ustunli ro'yxat telefonda bitta ustunga aylanadi.",
    related: ["css"],
  },
  {
    slug: "accessibility",
    term: "Qulaylik",
    en: "Accessibility (a11y)",
    ru: "Доступность",
    definition:
      "Saytdan imkoniyati cheklangan foydalanuvchilar ham teng foydalana olishini ta'minlash amaliyoti: klaviatura bilan boshqarish, ekran o'quvchi dasturlarga moslik, yetarli kontrast.",
    related: ["html", "css"],
  },
  {
    slug: "repozitoriy",
    term: "Repozitoriy",
    en: "Repository",
    ru: "Репозиторий",
    definition:
      "Loyiha fayllari va ularning butun o'zgarishlar tarixi saqlanadigan joy. Qisqacha \"repo\" deyiladi.",
    related: ["git", "commit"],
  },
  {
    slug: "git",
    term: "Git",
    en: "Git",
    definition:
      "Fayllar tarixini saqlaydigan taqsimlangan versiya nazorati tizimi. Har bir dasturchida loyihaning to'liq tarixi bo'ladi.",
    related: ["repozitoriy", "commit"],
  },
  {
    slug: "commit",
    term: "Commit",
    en: "Commit",
    ru: "Коммит",
    definition:
      "O'zgarishlarning saqlangan nuqtasi. Har bir commit kim, qachon va nima o'zgartirganini yozib qo'yadi.",
    related: ["git", "repozitoriy"],
  },
  {
    slug: "indeks",
    term: "Indeks",
    en: "Index",
    ru: "Индекс",
    definition:
      "Ma'lumotlar bazasida qidiruvni tezlashtiruvchi qo'shimcha tuzilma. Kitobning mundarijasiga o'xshaydi: butun sahifalarni varaqlash o'rniga to'g'ri joyga o'tasiz.",
    related: ["sql"],
  },
  {
    slug: "sql",
    term: "SQL",
    en: "Structured Query Language",
    ru: "SQL / язык запросов",
    definition:
      "Relyatsion ma'lumotlar bazasidan ma'lumot olish va o'zgartirish uchun ishlatiladigan til.",
    related: ["indeks", "api"],
  },
];

export function getGlossaryTerm(slug: string) {
  return glossary.find((t) => t.slug === slug);
}
