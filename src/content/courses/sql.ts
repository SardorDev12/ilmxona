import type { Course, Lesson } from "../types";

function draft(l: Partial<Lesson> & { slug: string; title: string }): Lesson {
  return {
    intro: "",
    whyImportant: "",
    body: [],
    commonMistakes: [],
    quiz: [],
    relatedTerms: [],
    durationMin: 13,
    updatedAt: "2026-08-05",
    authorUsername: "dsattorova",
    reviewerUsername: "brahimov",
    ...l,
  };
}

export const sqlCourse: Course = {
  slug: "sql",
  title: "SQL va ma'lumotlar bazasi",
  subtitle: "Ma'lumot bilan gaplashishni o'rganing",
  description:
    "SELECT'dan JOIN va indekslargacha. Ushbu kursda relyatsion ma'lumotlar bazasidan kerakli ma'lumotni tez va to'g'ri olishni o'rganasiz.",
  category: "Dasturlash",
  difficulty: "O'rta",
  durationHours: 20,
  accent: "from-emerald-500 to-teal-600",
  objectives: [
    "SELECT so'rovlarini ishonchli yozish",
    "Jadvallarni JOIN orqali bog'lash",
    "Guruhlash va agregat funksiyalardan foydalanish",
    "Indeks nima uchun kerakligini va qachon yordam berishini tushunish",
  ],
  prerequisites: ["Jadval va ustun tushunchasi haqida umumiy tasavvur"],
  authorUsername: "dsattorova",
  reviewerUsername: "brahimov",
  learners: 2760,
  modules: [
    {
      title: "So'rov asoslari",
      lessons: [
        draft({
          slug: "select",
          title: "SELECT so'rovi",
          intro:
            "Ma'lumotlar bazasidan ma'lumot olishning asosiy usuli. Ustunlarni tanlash, nomlash va tartiblash.",
          whyImportant:
            "SELECT — SQL'da eng ko'p yoziladigan buyruq. Uni yaxshi bilish qolgan hamma narsani osonlashtiradi.",
          body: [
            {
              type: "code",
              lang: "sql",
              code: `SELECT ism, familiya, ball
FROM talabalar
ORDER BY ball DESC
LIMIT 10;`,
            },
            {
              type: "note",
              text: "SELECT * ni ishlab chiqarish kodida ishlatmang — keraksiz ustunlar tarmoqni ortiqcha yuklaydi va jadval o'zgarganda kod buziladi.",
            },
          ],
          durationMin: 14,
        }),
        draft({
          slug: "where",
          title: "WHERE bilan filtrlash",
          intro:
            "Shartlar, mantiqiy operatorlar, LIKE, IN va BETWEEN.",
          whyImportant:
            "Filtrlashsiz so'rov butun jadvalni qaytaradi — bu katta bazada sekinlik va ortiqcha yuk demak.",
          body: [
            {
              type: "code",
              lang: "sql",
              code: `SELECT *
FROM buyurtmalar
WHERE holat = 'tolangan'
  AND summa > 100000
  AND sana BETWEEN '2026-01-01' AND '2026-06-30';`,
            },
            {
              type: "warning",
              text: "NULL qiymatni = bilan solishtirib bo'lmaydi. IS NULL yoki IS NOT NULL ishlatiladi.",
            },
          ],
          durationMin: 15,
        }),
        draft({
          slug: "order-limit",
          title: "Tartiblash va sahifalash",
          intro: "ORDER BY, LIMIT va OFFSET yordamida natijani boshqarish.",
          whyImportant:
            "Sahifalash bo'lmasa, ro'yxat sahifasi ming qatorli natijani bir yo'la yuklashga urinadi.",
          durationMin: 11,
        }),
      ],
    },
    {
      title: "Jadvallarni bog'lash",
      lessons: [
        draft({
          slug: "join",
          title: "JOIN turlari",
          intro:
            "INNER, LEFT, RIGHT va FULL JOIN — ular o'rtasidagi farqni misollarda ko'ramiz.",
          whyImportant:
            "Ma'lumot bir nechta jadvalga bo'lingan bo'ladi. JOIN'siz uni birlashtirib bo'lmaydi.",
          body: [
            {
              type: "code",
              lang: "sql",
              code: `SELECT t.ism, k.nomi AS kurs
FROM talabalar t
INNER JOIN yozilishlar y ON y.talaba_id = t.id
INNER JOIN kurslar k ON k.id = y.kurs_id;`,
            },
            {
              type: "table",
              headers: ["JOIN turi", "Nimani qaytaradi"],
              rows: [
                ["INNER JOIN", "Faqat ikkala jadvalda mos keladigan qatorlar"],
                ["LEFT JOIN", "Chapdagi barcha qatorlar + mos kelganlari"],
                ["RIGHT JOIN", "O'ngdagi barcha qatorlar + mos kelganlari"],
                ["FULL JOIN", "Ikkala jadvaldagi barcha qatorlar"],
              ],
            },
          ],
          durationMin: 20,
        }),
        draft({
          slug: "group-by",
          title: "Guruhlash va agregat funksiyalar",
          intro: "COUNT, SUM, AVG, MIN, MAX hamda GROUP BY va HAVING.",
          whyImportant:
            "Hisobot tayyorlashning deyarli barchasi guruhlash ustiga quriladi.",
          body: [
            {
              type: "code",
              lang: "sql",
              code: `SELECT kurs_id, COUNT(*) AS talabalar_soni, AVG(ball) AS ortacha
FROM yozilishlar
GROUP BY kurs_id
HAVING COUNT(*) > 5
ORDER BY ortacha DESC;`,
            },
            {
              type: "note",
              text: "WHERE guruhlashdan oldin, HAVING esa guruhlashdan keyin filtrlaydi.",
            },
          ],
          durationMin: 18,
        }),
      ],
    },
    {
      title: "Ma'lumotni o'zgartirish va tezlik",
      lessons: [
        draft({
          slug: "insert-update-delete",
          title: "INSERT, UPDATE va DELETE",
          intro: "Ma'lumot qo'shish, yangilash va o'chirish.",
          whyImportant:
            "Bu buyruqlar ma'lumotni o'zgartiradi — xato so'rov qaytarib bo'lmaydigan zarar keltirishi mumkin.",
          body: [
            {
              type: "warning",
              text: "UPDATE yoki DELETE yozganda WHERE ni unutish — butun jadvalni buzadi. Avval o'sha WHERE bilan SELECT qilib, nechta qator tegishini ko'ring.",
            },
          ],
          durationMin: 16,
        }),
        draft({
          slug: "indekslar",
          title: "Indekslar",
          intro:
            "Indeks nima, u qanday ishlaydi va nima uchun har bir ustunga indeks qo'yish yomon fikr.",
          whyImportant:
            "To'g'ri indeks so'rovni yuz barobar tezlashtirishi mumkin; ortiqcha indeks esa yozishni sekinlashtiradi.",
          durationMin: 19,
        }),
      ],
    },
  ],
};
