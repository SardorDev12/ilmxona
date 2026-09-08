import type { Course, Lesson } from "../types";

function draft(l: Partial<Lesson> & { slug: string; title: string }): Lesson {
  return {
    intro: "",
    whyImportant: "",
    body: [],
    commonMistakes: [],
    quiz: [],
    relatedTerms: [],
    durationMin: 12,
    updatedAt: "2026-08-19",
    authorUsername: "avaliyev",
    reviewerUsername: "dsattorova",
    ...l,
  };
}

const massivlar: Lesson = {
  slug: "massivlar",
  title: "Massivlar",
  intro:
    "Massiv — tartiblangan qiymatlar ro'yxati. Foydalanuvchilar, mahsulotlar, xabarlar — dasturdagi deyarli har qanday ro'yxat massivda saqlanadi.",
  whyImportant:
    "Kundalik ishning katta qismi ro'yxatni filtrlash, o'zgartirish va yig'ishdan iborat. Massiv metodlarini bilsangiz, o'nlab qator sikl kodini bitta qatorga aylantirasiz.",
  durationMin: 18,
  updatedAt: "2026-09-02",
  authorUsername: "avaliyev",
  reviewerUsername: "dsattorova",
  body: [
    { type: "heading", text: "Massiv yaratish" },
    {
      type: "code",
      lang: "js",
      code: `const mevalar = ["olma", "anor", "uzum"];
const sonlar = [1, 2, 3, 5, 8];
const aralash = ["matn", 42, true, null];

console.log(mevalar.length); // 3`,
    },
    {
      type: "paragraph",
      text: "Massiv indeksi noldan boshlanadi: birinchi element mevalar[0], oxirgisi esa mevalar[mevalar.length - 1].",
    },
    {
      type: "note",
      text: "Oxirgi elementni olishning qulay yo'li — mevalar.at(-1). Manfiy indeks oxiridan sanaydi.",
    },
    { type: "heading", text: "Element qo'shish va olib tashlash" },
    {
      type: "table",
      headers: ["Metod", "Nima qiladi", "Qayerda"],
      rows: [
        ["push", "Element qo'shadi", "Oxiriga"],
        ["pop", "Elementni olib tashlaydi", "Oxiridan"],
        ["unshift", "Element qo'shadi", "Boshiga"],
        ["shift", "Elementni olib tashlaydi", "Boshidan"],
      ],
    },
    {
      type: "warning",
      text: "Bu to'rt metod massivning o'zini o'zgartiradi (mutatsiya). Agar asl massiv kerak bo'lsa, avval nusxa oling: const nusxa = [...asl].",
    },
    { type: "heading", text: "Eng muhim uchlik: map, filter, reduce" },
    {
      type: "paragraph",
      text: "Bu uch metod massiv bilan ishlashning asosini tashkil qiladi. Ularning hech biri asl massivni o'zgartirmaydi — har biri yangi natija qaytaradi.",
    },
    {
      type: "heading",
      text: "map — har bir elementni o'zgartirish",
    },
    {
      type: "code",
      lang: "js",
      caption: "map har doim asl massiv bilan bir xil uzunlikdagi yangi massiv qaytaradi",
      code: `const narxlar = [1000, 2500, 400];

const chegirmali = narxlar.map((narx) => narx * 0.9);

console.log(chegirmali); // [900, 2250, 360]
console.log(narxlar);    // [1000, 2500, 400] — o'zgarmadi`,
    },
    {
      type: "heading",
      text: "filter — kerakli elementlarni ajratish",
    },
    {
      type: "code",
      lang: "js",
      code: `const talabalar = [
  { ism: "Aziz", ball: 85 },
  { ism: "Malika", ball: 92 },
  { ism: "Bobur", ball: 64 },
];

const alochilar = talabalar.filter((t) => t.ball >= 80);

console.log(alochilar.length); // 2`,
    },
    {
      type: "paragraph",
      text: "filter'ga berilgan funksiya true qaytarsa element saqlanadi, false qaytarsa tashlab yuboriladi.",
    },
    {
      type: "heading",
      text: "reduce — hammasini bitta qiymatga yig'ish",
    },
    {
      type: "code",
      lang: "js",
      code: `const sonlar = [10, 20, 30];

const yigindi = sonlar.reduce((jami, son) => jami + son, 0);

console.log(yigindi); // 60`,
    },
    {
      type: "paragraph",
      text: "reduce ikkita narsa oladi: yig'uvchi funksiya va boshlang'ich qiymat (bu yerda 0). Har qadamda funksiya oldingi natija va joriy elementni oladi.",
    },
    {
      type: "playground",
      html: `<h3>Savat</h3>
<ul id="royxat"></ul>
<p id="jami"></p>`,
      css: `body { font-family: system-ui, sans-serif; padding: 16px; color: #0f172a; }
h3 { margin: 0 0 8px; }
ul { padding-left: 18px; line-height: 1.7; }
#jami { font-weight: 700; margin-top: 12px; }`,
      js: `const savat = [
  { nom: "Klaviatura", narx: 250000, soni: 1 },
  { nom: "Sichqoncha", narx: 120000, soni: 2 },
  { nom: "Monitor", narx: 1800000, soni: 1 },
];

// map bilan matnga aylantiramiz
const qatorlar = savat.map(
  (m) => \`\${m.nom} — \${m.soni} x \${m.narx.toLocaleString("uz")} so'm\`
);

document.getElementById("royxat").innerHTML = qatorlar
  .map((q) => \`<li>\${q}</li>\`)
  .join("");

// reduce bilan umumiy summani hisoblaymiz
const jami = savat.reduce((sum, m) => sum + m.narx * m.soni, 0);

document.getElementById("jami").textContent =
  "Jami: " + jami.toLocaleString("uz") + " so'm";`,
    },
    { type: "heading", text: "Zanjir qilib ishlatish" },
    {
      type: "paragraph",
      text: "map va filter yangi massiv qaytargani uchun ularni ketma-ket ulash mumkin. Kod yuqoridan pastga o'qiladi va niyati aniq ko'rinadi.",
    },
    {
      type: "code",
      lang: "js",
      code: `const buyurtmalar = [
  { mahsulot: "Kitob", summa: 45000, tolangan: true },
  { mahsulot: "Daftar", summa: 12000, tolangan: false },
  { mahsulot: "Ruchka", summa: 8000, tolangan: true },
];

const tushum = buyurtmalar
  .filter((b) => b.tolangan)
  .map((b) => b.summa)
  .reduce((jami, summa) => jami + summa, 0);

console.log(tushum); // 53000`,
    },
    { type: "heading", text: "Qidirish metodlari" },
    {
      type: "code",
      lang: "js",
      code: `const sonlar = [4, 9, 16, 25];

sonlar.find((s) => s > 10);      // 16 — birinchi mos element
sonlar.findIndex((s) => s > 10); // 2  — uning indeksi
sonlar.includes(9);              // true
sonlar.some((s) => s > 20);      // true  — bittasi ham mos kelsa
sonlar.every((s) => s > 0);      // true  — hammasi mos kelsa`,
    },
  ],
  commonMistakes: [
    "map o'rniga forEach ishlatib, natijani qaytarishni kutish. forEach har doim undefined qaytaradi.",
    "map ichida return yozishni unutish. O'q funksiyada figurali qavs ochsangiz, return majburiy.",
    "reduce'ga boshlang'ich qiymat bermaslik. Bo'sh massivda bu xatolikka olib keladi.",
    "sort() sonlarni matn sifatida tartiblashini unutish: [10, 9].sort() natijasi [10, 9] bo'ladi. To'g'risi: sort((a, b) => a - b).",
  ],
  exercise: {
    title: "O'rtacha ballni hisoblang",
    instructions:
      "talabalar massividan faqat imtihon topshirganlarni (topshirdi: true) ajratib oling va ularning o'rtacha ballini hisoblang.",
    starterCode: `const talabalar = [
  { ism: "Aziz", ball: 85, topshirdi: true },
  { ism: "Malika", ball: 92, topshirdi: true },
  { ism: "Bobur", ball: 0, topshirdi: false },
  { ism: "Nodira", ball: 78, topshirdi: true },
];

// O'rtacha ballni hisoblang
const ortacha = 0;

console.log(ortacha);`,
    solution: `const topshirganlar = talabalar.filter((t) => t.topshirdi);

const ortacha =
  topshirganlar.reduce((jami, t) => jami + t.ball, 0) / topshirganlar.length;

console.log(ortacha); // 85`,
    hints: [
      "Avval filter bilan topshirdi qiymati true bo'lganlarni ajrating.",
      "Keyin reduce bilan ballar yig'indisini toping.",
      "Yig'indini massiv uzunligiga bo'ling — lekin filtrlangan massivning uzunligiga.",
    ],
  },
  quiz: [
    {
      id: "q1",
      question: "map metodi nima qaytaradi?",
      type: "single",
      answers: [
        { id: "a", text: "O'zgartirilgan asl massivni" },
        { id: "b", text: "Asl massiv bilan bir xil uzunlikdagi yangi massivni" },
        { id: "c", text: "Faqat shartga mos elementlardan iborat yangi massivni" },
        { id: "d", text: "undefined" },
      ],
      correct: ["b"],
      explanation:
        "map har bir element uchun funksiyani chaqirib, natijalardan yangi massiv yasaydi. Uzunlik o'zgarmaydi — buning uchun filter kerak.",
    },
    {
      id: "q2",
      question: "Qaysi metodlar asl massivni o'zgartiradi (mutatsiya qiladi)?",
      type: "multiple",
      answers: [
        { id: "a", text: "push" },
        { id: "b", text: "map" },
        { id: "c", text: "sort" },
        { id: "d", text: "filter" },
      ],
      correct: ["a", "c"],
      explanation:
        "push va sort massivning o'zini o'zgartiradi. map va filter esa har doim yangi massiv qaytaradi, aslga tegmaydi.",
    },
    {
      id: "q3",
      question:
        "[10, 9, 100].sort() natijasi [9, 10, 100] bo'ladi.",
      type: "boolean",
      answers: [
        { id: "a", text: "To'g'ri" },
        { id: "b", text: "Noto'g'ri" },
      ],
      correct: ["b"],
      explanation:
        "sort() qiymatlarni matnga aylantirib solishtiradi, shuning uchun natija [10, 100, 9] bo'ladi. Sonlar uchun sort((a, b) => a - b) yozish kerak.",
    },
    {
      id: "q4",
      question: "Bo'sh massivda reduce'ni boshlang'ich qiymatsiz chaqirsangiz nima bo'ladi?",
      type: "single",
      answers: [
        { id: "a", text: "undefined qaytaradi" },
        { id: "b", text: "0 qaytaradi" },
        { id: "c", text: "TypeError xatoligi yuz beradi" },
        { id: "d", text: "Bo'sh massiv qaytaradi" },
      ],
      correct: ["c"],
      explanation:
        "Boshlang'ich qiymatsiz reduce bo'sh massivda TypeError beradi. Shuning uchun har doim boshlang'ich qiymat yozish tavsiya etiladi.",
    },
  ],
  relatedTerms: ["javascript", "api", "json"],
};

export const javascriptCourse: Course = {
  slug: "javascript",
  title: "JavaScript asoslari",
  subtitle: "Sahifangizni jonlantiring",
  description:
    "O'zgaruvchilardan tortib asinxron kodgacha. Ushbu kursda JavaScript tilining asosiy tushunchalarini amaliy misollar orqali o'rganasiz va brauzerda ishlaydigan interaktiv sahifalar yozasiz.",
  category: "Dasturlash",
  difficulty: "O'rta",
  durationHours: 28,
  accent: "from-yellow-400 to-amber-500",
  objectives: [
    "O'zgaruvchi, tur va funksiyalar bilan ishonchli ishlash",
    "Massiv va obyektlarni samarali qayta ishlash",
    "DOM orqali sahifani o'zgartirish",
    "Promise va async/await yordamida server bilan ishlash",
  ],
  prerequisites: ["HTML asoslari", "CSS bo'yicha boshlang'ich tushuncha"],
  authorUsername: "avaliyev",
  reviewerUsername: "dsattorova",
  learners: 6940,
  modules: [
    {
      title: "Til asoslari",
      lessons: [
        draft({
          slug: "ozgaruvchilar",
          title: "O'zgaruvchilar va turlar",
          intro:
            "let, const va var o'rtasidagi farq, hamda JavaScript'dagi asosiy ma'lumot turlari.",
          whyImportant:
            "const'ni standart tanlov qilib olsangiz, kodda kutilmagan o'zgarishlar keskin kamayadi.",
          body: [
            {
              type: "code",
              lang: "js",
              code: `const ism = "Aziz";      // qayta tayinlab bo'lmaydi
let yosh = 25;           // o'zgarishi mumkin
yosh = 26;               // to'g'ri

const raqamlar = [1, 2];
raqamlar.push(3);        // to'g'ri — massiv ichi o'zgardi, bog'lanish emas`,
            },
            {
              type: "note",
              text: "const qiymatni emas, bog'lanishni qotiradi. Massiv yoki obyekt ichini o'zgartirish mumkin.",
            },
          ],
          durationMin: 14,
        }),
        draft({
          slug: "funksiyalar",
          title: "Funksiyalar",
          intro:
            "Funksiya e'lon qilish, o'q funksiyalar, parametrlar va qaytarish qiymati.",
          whyImportant:
            "Takrorlanadigan kodni funksiyaga chiqarish — kodni o'qiladigan qilishning eng arzon usuli.",
          body: [
            {
              type: "code",
              lang: "js",
              code: `function salomlash(ism) {
  return "Salom, " + ism + "!";
}

const salomlashQisqa = (ism) => \`Salom, \${ism}!\`;`,
            },
          ],
          durationMin: 16,
        }),
        draft({
          slug: "shartlar",
          title: "Shartlar va sikllar",
          intro:
            "if, else, switch, for, while va zamonaviy for...of sikli.",
          whyImportant:
            "Dastur mantiqi shartlar ustiga quriladi — bu tilning eng ko'p ishlatiladigan qismi.",
          durationMin: 15,
        }),
      ],
    },
    {
      title: "Ma'lumotlar bilan ishlash",
      lessons: [
        massivlar,
        draft({
          slug: "obyektlar",
          title: "Obyektlar",
          intro:
            "Kalit-qiymat juftliklari, ichma-ich obyektlar va destrukturizatsiya.",
          whyImportant:
            "Serverdan keladigan har qanday ma'lumot deyarli har doim obyekt ko'rinishida bo'ladi.",
          body: [
            {
              type: "code",
              lang: "js",
              code: `const talaba = {
  ism: "Malika",
  yosh: 21,
  kurslar: ["HTML", "CSS"],
};

const { ism, kurslar } = talaba;   // destrukturizatsiya
console.log(ism);                   // "Malika"`,
            },
          ],
          durationMin: 17,
        }),
        draft({
          slug: "json",
          title: "JSON bilan ishlash",
          intro:
            "JSON.parse va JSON.stringify — matn va obyekt o'rtasidagi ko'prik.",
          whyImportant:
            "API'lar bilan ishlashda ma'lumot deyarli har doim JSON formatida keladi.",
          durationMin: 11,
        }),
      ],
    },
    {
      title: "Brauzer bilan ishlash",
      lessons: [
        draft({
          slug: "dom",
          title: "DOM bilan ishlash",
          intro:
            "querySelector, textContent, classList va element yaratish — sahifani JavaScript orqali o'zgartirish.",
          whyImportant:
            "Foydalanuvchi ko'radigan har qanday o'zgarish oxir-oqibat DOM orqali sodir bo'ladi.",
          body: [
            {
              type: "code",
              lang: "js",
              code: `const tugma = document.querySelector("#tugma");

tugma.addEventListener("click", () => {
  document.querySelector("#natija").textContent = "Bosildi!";
});`,
            },
          ],
          durationMin: 19,
        }),
        draft({
          slug: "hodisalar",
          title: "Hodisalar (events)",
          intro:
            "addEventListener, hodisa obyekti, ko'pikchalanish (bubbling) va delegatsiya.",
          whyImportant:
            "Hodisa delegatsiyasi yuzlab elementga alohida tinglovchi qo'shish o'rniga bittasi bilan kifoyalanish imkonini beradi.",
          durationMin: 16,
        }),
      ],
    },
    {
      title: "Asinxron JavaScript",
      lessons: [
        draft({
          slug: "promise",
          title: "Promise",
          intro:
            "Vaqt talab qiladigan amallarni ifodalash usuli: pending, fulfilled va rejected holatlari.",
          whyImportant:
            "Serverga so'rov yuborish bir zumda tugamaydi — Promise shuni boshqarish uchun kerak.",
          durationMin: 18,
        }),
        draft({
          slug: "async-await",
          title: "async va await",
          intro:
            "Promise'lar ustidagi qulay sintaksis: asinxron kodni oddiy kodday o'qish.",
          whyImportant:
            "async/await zanjir ko'rinishidagi .then() chaqiruvlarini ancha tushunarli qiladi.",
          body: [
            {
              type: "code",
              lang: "js",
              code: `async function kurslarniOl() {
  try {
    const javob = await fetch("/api/kurslar");
    const kurslar = await javob.json();
    return kurslar;
  } catch (xato) {
    console.error("So'rov muvaffaqiyatsiz:", xato);
    return [];
  }
}`,
            },
            {
              type: "warning",
              text: "await'ni try/catch ichiga olishni unutmang — aks holda xatolik hech kim ushlamagan holda qoladi.",
            },
          ],
          durationMin: 20,
        }),
        draft({
          slug: "fetch",
          title: "fetch bilan API'ga murojaat",
          intro:
            "GET va POST so'rovlari, sarlavhalar (headers) va javob holatini tekshirish.",
          whyImportant:
            "Deyarli har bir zamonaviy ilova ma'lumotni serverdan fetch orqali oladi.",
          durationMin: 17,
        }),
      ],
    },
  ],
};
