import type { Course, Lesson } from "../types";

function draft(l: Partial<Lesson> & { slug: string; title: string }): Lesson {
  return {
    intro: "",
    whyImportant: "",
    body: [],
    commonMistakes: [],
    quiz: [],
    relatedTerms: [],
    durationMin: 10,
    updatedAt: "2026-08-11",
    authorUsername: "mkarimova",
    reviewerUsername: "avaliyev",
    ...l,
  };
}

const flexbox: Lesson = {
  slug: "flexbox",
  title: "Flexbox",
  intro:
    "Flexbox — elementlarni bir o'q bo'ylab joylashtirish uchun mo'ljallangan tizim. Qatorga tizish, markazlashtirish va bo'sh joyni taqsimlash — barchasi bir necha qator kod bilan.",
  whyImportant:
    "Flexbox'gacha markazlashtirish uchun float, absolute yoki table hiylalari ishlatilardi. Endi bu ikki qator. Interfeys tuzadigan har bir dasturchi buni kunda ishlatadi.",
  durationMin: 16,
  updatedAt: "2026-09-01",
  authorUsername: "mkarimova",
  reviewerUsername: "avaliyev",
  body: [
    { type: "heading", text: "Konteyner va elementlar" },
    {
      type: "paragraph",
      text: "Flexbox har doim ikki darajada ishlaydi: ota element (konteyner) va uning bevosita bolalari. display: flex ni konteynerga beramiz, bolalari esa avtomatik flex elementga aylanadi.",
    },
    {
      type: "code",
      lang: "css",
      code: `.konteyner {
  display: flex;
}`,
    },
    {
      type: "paragraph",
      text: "Shu bitta qatordan keyin bolalar yonma-yon tizilib qoladi — chunki asosiy o'q (main axis) standart holatda gorizontal.",
    },
    { type: "heading", text: "Ikki o'q" },
    {
      type: "paragraph",
      text: "Flexbox'ni tushunishning kaliti — ikkita o'q borligini bilish. flex-direction asosiy o'qni belgilaydi, ikkinchisi esa unga perpendikulyar bo'lgan ko'ndalang o'q (cross axis).",
    },
    {
      type: "table",
      headers: ["flex-direction", "Asosiy o'q", "Ko'ndalang o'q"],
      rows: [
        ["row (standart)", "Chapdan o'ngga", "Yuqoridan pastga"],
        ["column", "Yuqoridan pastga", "Chapdan o'ngga"],
        ["row-reverse", "O'ngdan chapga", "Yuqoridan pastga"],
        ["column-reverse", "Pastdan yuqoriga", "Chapdan o'ngga"],
      ],
    },
    {
      type: "note",
      text: "justify-content har doim asosiy o'q bo'ylab, align-items esa ko'ndalang o'q bo'ylab ishlaydi. flex-direction: column qilsangiz, ular o'rin almashgandek tuyuladi — aslida o'qlar aylangan.",
    },
    { type: "heading", text: "Joylashtirish" },
    {
      type: "code",
      lang: "css",
      caption: "Eng ko'p ishlatiladigan qiymatlar",
      code: `.konteyner {
  display: flex;

  /* asosiy o'q bo'ylab */
  justify-content: center;        /* flex-start | flex-end | space-between | space-around */

  /* ko'ndalang o'q bo'ylab */
  align-items: center;            /* flex-start | flex-end | stretch | baseline */

  /* elementlar orasidagi masofa */
  gap: 16px;
}`,
    },
    {
      type: "paragraph",
      text: "Quyidagi maydonda qiymatlarni o'zgartirib ko'ring — natijani darhol ko'rasiz.",
    },
    {
      type: "playground",
      html: `<div class="konteyner">
  <div class="element">1</div>
  <div class="element">2</div>
  <div class="element">3</div>
</div>`,
      css: `body { font-family: system-ui, sans-serif; padding: 16px; }

.konteyner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;

  height: 160px;
  padding: 12px;
  background: #eff6ff;
  border-radius: 10px;
}

.element {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  background: #1d4ed8;
  color: white;
  font-weight: 700;
  border-radius: 8px;
}`,
    },
    { type: "heading", text: "Markazlashtirish" },
    {
      type: "paragraph",
      text: "Eng mashhur savol — elementni tik va yotiq markazga qanday qo'yish. Flexbox bilan javob uch qator:",
    },
    {
      type: "code",
      lang: "css",
      code: `.konteyner {
  display: flex;
  justify-content: center;
  align-items: center;
}`,
    },
    { type: "heading", text: "flex-grow, flex-shrink va flex-basis" },
    {
      type: "paragraph",
      text: "Bu uch xususiyat elementning bo'sh joyni qanday egallashini boshqaradi. Ular odatda qisqartma flex orqali yoziladi.",
    },
    {
      type: "code",
      lang: "css",
      code: `.yon-panel {
  flex: 0 0 240px;   /* o'smaydi, kichraymaydi, kengligi 240px */
}

.asosiy {
  flex: 1;           /* qolgan bo'sh joyni to'liq egallaydi */
}`,
    },
    {
      type: "warning",
      text: "flex: 1 yozganda flex-basis 0% bo'ladi. Ya'ni elementning ichidagi kontent kengligi hisobga olinmaydi — uzun matn ham qisqa matn bilan teng joy oladi.",
    },
    { type: "heading", text: "flex-wrap" },
    {
      type: "paragraph",
      text: "Standart holatda elementlar bitta qatorga tiqilib, kichrayib ketaveradi. flex-wrap: wrap ularga keyingi qatorga o'tishga ruxsat beradi — mobil ekranlar uchun juda muhim.",
    },
    {
      type: "code",
      lang: "css",
      code: `.konteyner {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.karta {
  flex: 1 1 260px;   /* kamida 260px, joy bo'lsa kengayadi */
}`,
    },
  ],
  commonMistakes: [
    "justify-content va align-items ni chalkashtirish. Birinchisi asosiy o'q, ikkinchisi ko'ndalang o'q bo'ylab ishlaydi.",
    "Flexbox'ni nabira elementlarga ta'sir qiladi deb o'ylash. U faqat bevosita bolalarga ta'sir qiladi.",
    "gap o'rniga margin ishlatish — chetdagi elementlarda ortiqcha bo'shliq qoladi.",
    "flex-wrap ni unutish, natijada tor ekranda kontent siqilib o'qib bo'lmaydigan holga keladi.",
  ],
  exercise: {
    title: "Navigatsiya panelini joylashtiring",
    instructions:
      "Logotip chap tomonda, havolalar o'ng tomonda turadigan navigatsiya panelini yarating. Elementlar tik markazda bo'lsin.",
    starterCode: `.nav {
  /* Kodni shu yerga yozing */
}`,
    solution: `.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}`,
    hints: [
      "Ikki uchga ajratish uchun justify-content ning space-between qiymatidan foydalaning.",
      "Tik markazlashtirish align-items: center orqali qilinadi.",
    ],
  },
  quiz: [
    {
      id: "q1",
      question: "display: flex qaysi elementlarga ta'sir qiladi?",
      type: "single",
      answers: [
        { id: "a", text: "Konteyner ichidagi barcha elementlarga, chuqurligidan qat'i nazar" },
        { id: "b", text: "Faqat konteynerning bevosita bolalariga" },
        { id: "c", text: "Faqat konteynerning o'ziga" },
        { id: "d", text: "Sahifadagi barcha elementlarga" },
      ],
      correct: ["b"],
      explanation:
        "Flexbox faqat bir daraja pastga ta'sir qiladi. Nabiralarni joylashtirish uchun ularning otasiga ham display: flex berish kerak.",
    },
    {
      id: "q2",
      question: "flex-direction: column bo'lganda justify-content qaysi yo'nalishda ishlaydi?",
      type: "single",
      answers: [
        { id: "a", text: "Gorizontal (chapdan o'ngga)" },
        { id: "b", text: "Vertikal (yuqoridan pastga)" },
        { id: "c", text: "Ikkala yo'nalishda" },
        { id: "d", text: "Umuman ishlamaydi" },
      ],
      correct: ["b"],
      explanation:
        "justify-content har doim asosiy o'q bo'ylab ishlaydi. column bo'lganda asosiy o'q vertikal, shuning uchun u yuqoridan pastga joylashtiradi.",
    },
    {
      id: "q3",
      question: "Elementlar orasidagi masofa uchun gap xususiyatidan foydalanish mumkin.",
      type: "boolean",
      answers: [
        { id: "a", text: "To'g'ri" },
        { id: "b", text: "Noto'g'ri" },
      ],
      correct: ["a"],
      explanation:
        "gap flexbox'da to'liq qo'llab-quvvatlanadi va margin hiylalaridan ancha qulay — chetlarda ortiqcha bo'shliq qoldirmaydi.",
    },
  ],
  relatedTerms: ["css", "responsive-dizayn", "dom"],
};

export const cssCourse: Course = {
  slug: "css",
  title: "CSS va zamonaviy joylashuv",
  subtitle: "Sahifangizni ko'rinishga keltiring",
  description:
    "Selektorlar va box model'dan boshlab, Flexbox va Grid bilan murakkab joylashuvlar qurishgacha. Kurs oxirida moslashuvchan (responsive) interfeys yozishni bilasiz.",
  category: "Dasturlash",
  difficulty: "Boshlang'ich",
  durationHours: 16,
  accent: "from-sky-500 to-blue-600",
  objectives: [
    "Selektorlar va ustuvorlik (specificity) qoidalarini tushunish",
    "Box model bilan ishonchli ishlash",
    "Flexbox va Grid yordamida joylashuv qurish",
    "Moslashuvchan, mobil qurilmaga mos dizayn yozish",
  ],
  prerequisites: ["HTML asoslari kursi yoki shunga teng bilim"],
  authorUsername: "mkarimova",
  reviewerUsername: "avaliyev",
  learners: 3870,
  modules: [
    {
      title: "Asoslar",
      lessons: [
        draft({
          slug: "selektorlar",
          title: "Selektorlar",
          intro:
            "Selektor — CSS qoidasi qaysi elementlarga tegishli ekanini aytadigan qism. Element, klass, id va ularning birikmalarini ko'rib chiqamiz.",
          whyImportant:
            "Selektorni noto'g'ri tanlash keyinchalik butun uslub faylini tuzatib bo'lmaydigan holga keltiradi.",
          body: [
            {
              type: "code",
              lang: "css",
              code: `p { color: #334155; }              /* element */
.izoh { font-size: 14px; }        /* klass */
#sarlavha { font-weight: 700; }   /* id */
article p { line-height: 1.6; }   /* ichidagi */`,
            },
          ],
          durationMin: 12,
        }),
        draft({
          slug: "box-model",
          title: "Box model",
          intro:
            "Har bir element to'rtburchak quti: content, padding, border va margin. Ularning o'zaro munosabatini tushunish CSS'dagi yarim muammoni hal qiladi.",
          whyImportant:
            "Kenglik nega kutganingizdan katta chiqayotganining sababi deyarli har doim box model'da.",
          body: [
            {
              type: "note",
              text: "box-sizing: border-box qo'ysangiz, width ichiga padding va border ham kiradi — bu ancha tabiiy his qilinadi.",
            },
          ],
          durationMin: 14,
        }),
        draft({
          slug: "ranglar-va-birliklar",
          title: "Ranglar va o'lchov birliklari",
          intro:
            "px, rem, em, %, vh va vw. Qachon qaysi birlikni tanlash kerakligini misollar bilan ko'ramiz.",
          whyImportant:
            "rem ishlatish foydalanuvchining brauzerdagi shrift o'lchami sozlamasini hurmat qiladi.",
          durationMin: 11,
        }),
      ],
    },
    {
      title: "Joylashuv",
      lessons: [
        flexbox,
        draft({
          slug: "grid",
          title: "CSS Grid",
          intro:
            "Grid — ikki o'lchovli joylashuv tizimi. Flexbox qator yoki ustun bilan ishlasa, Grid ikkalasini bir vaqtda boshqaradi.",
          whyImportant:
            "Sahifaning umumiy karkasi (header, yon panel, kontent, footer) uchun Grid Flexbox'dan ancha qulay.",
          body: [
            {
              type: "code",
              lang: "css",
              code: `.sahifa {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
}`,
            },
          ],
          durationMin: 18,
        }),
        draft({
          slug: "position",
          title: "position xususiyati",
          intro:
            "static, relative, absolute, fixed va sticky — beshta qiymat va ularning haqiqiy farqlari.",
          whyImportant:
            "Modal oyna, ochiluvchi menyu va yopishqoq sarlavha — barchasi position ustiga quriladi.",
          durationMin: 13,
        }),
      ],
    },
    {
      title: "Moslashuvchanlik",
      lessons: [
        draft({
          slug: "media-query",
          title: "Media so'rovlar",
          intro:
            "Ekran kengligiga qarab uslubni o'zgartirish. Mobile-first yondashuvi nima uchun afzalligini ko'ramiz.",
          whyImportant:
            "O'zbekistonda foydalanuvchilarning katta qismi saytga telefondan kiradi.",
          body: [
            {
              type: "code",
              lang: "css",
              code: `/* avval mobil uchun */
.karta { flex-direction: column; }

/* keyin kattaroq ekran uchun */
@media (min-width: 768px) {
  .karta { flex-direction: row; }
}`,
            },
          ],
          durationMin: 15,
        }),
        draft({
          slug: "responsive-rasmlar",
          title: "Moslashuvchan rasmlar",
          intro:
            "srcset, sizes va picture elementi yordamida har bir ekranga mos rasm yuborish.",
          whyImportant:
            "Sekin internetda katta rasm — sahifa ochilmasligining birinchi sababi.",
          durationMin: 12,
        }),
      ],
    },
  ],
};
