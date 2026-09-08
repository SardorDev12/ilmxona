import type { Course, Lesson } from "../types";

function draft(l: Partial<Lesson> & { slug: string; title: string }): Lesson {
  return {
    intro: "",
    whyImportant: "",
    body: [],
    commonMistakes: [],
    quiz: [],
    relatedTerms: [],
    durationMin: 8,
    updatedAt: "2026-08-14",
    authorUsername: "mkarimova",
    reviewerUsername: "avaliyev",
    ...l,
  };
}

const formalar: Lesson = {
  slug: "formalar",
  title: "HTML formalar",
  intro:
    "Forma — foydalanuvchidan ma'lumot oladigan asosiy vosita. Ro'yxatdan o'tish, qidiruv, izoh qoldirish — bularning barchasi forma orqali ishlaydi.",
  whyImportant:
    "Formani noto'g'ri yozsangiz, sahifangiz klaviatura bilan ishlatib bo'lmaydigan, ekran o'quvchi dasturlar o'qiy olmaydigan bo'lib qoladi. To'g'ri yozilgan forma esa hech qanday qo'shimcha JavaScript'siz ham ishlaydi.",
  durationMin: 14,
  updatedAt: "2026-08-28",
  authorUsername: "mkarimova",
  reviewerUsername: "avaliyev",
  body: [
    {
      type: "heading",
      text: "Formaning tuzilishi",
    },
    {
      type: "paragraph",
      text: "Har bir forma <form> elementi ichida joylashadi. Uning ikkita muhim atributi bor: action — ma'lumot qayerga yuborilishi, method — qanday yuborilishi (GET yoki POST).",
    },
    {
      type: "code",
      lang: "html",
      caption: "Eng sodda forma",
      code: `<form action="/royxat" method="post">
  <label for="ism">Ismingiz</label>
  <input id="ism" name="ism" type="text" required>

  <button type="submit">Yuborish</button>
</form>`,
    },
    {
      type: "heading",
      text: "label va input bog'lanishi",
    },
    {
      type: "paragraph",
      text: "label elementining for atributi input elementining id atributiga to'liq mos kelishi kerak. Shunda yorliqni bosganda kursor avtomatik maydonga o'tadi, ekran o'quvchi dastur esa maydon nima uchun ekanini aytib beradi.",
    },
    {
      type: "warning",
      text: "label'siz input — eng ko'p uchraydigan qulaylik xatosi. placeholder label o'rnini bosa olmaydi: foydalanuvchi yoza boshlashi bilan u yo'qoladi.",
    },
    {
      type: "heading",
      text: "Kirish maydoni turlari",
    },
    {
      type: "paragraph",
      text: "type atributi brauzerga maydon qanday ma'lumot kutayotganini aytadi. Telefonda mos klaviatura ochilishi ham shunga bog'liq.",
    },
    {
      type: "table",
      headers: ["type", "Nima uchun", "Telefonda klaviatura"],
      rows: [
        ["text", "Oddiy matn", "Harflar"],
        ["email", "Elektron pochta", "@ belgisi bilan"],
        ["tel", "Telefon raqami", "Raqamlar"],
        ["number", "Son", "Raqamlar"],
        ["password", "Parol", "Harflar, matn yashirin"],
        ["date", "Sana", "Sana tanlagich"],
      ],
    },
    {
      type: "heading",
      text: "Brauzer tekshiruvi",
    },
    {
      type: "paragraph",
      text: "required, minlength, maxlength, min, max va pattern atributlari yordamida ma'lumot to'g'riligini JavaScript'siz tekshirish mumkin. Brauzer o'zi xabar ko'rsatadi.",
    },
    {
      type: "playground",
      html: `<form>
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required>

  <label for="parol">Parol</label>
  <input id="parol" name="parol" type="password" minlength="8" required>

  <button type="submit">Ro'yxatdan o'tish</button>
</form>`,
      css: `body { font-family: system-ui, sans-serif; padding: 16px; }
form { display: grid; gap: 8px; max-width: 320px; }
label { font-weight: 600; font-size: 14px; }
input {
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
}
button {
  margin-top: 8px;
  padding: 10px;
  border: 0;
  border-radius: 6px;
  background: #1d4ed8;
  color: white;
  font-weight: 600;
  cursor: pointer;
}`,
    },
    {
      type: "note",
      text: "Yuqoridagi formani to'ldirmasdan yuborib ko'ring — brauzer o'zi ogohlantiradi. Parolga 8 tadan kam belgi kiriting va farqni ko'ring.",
    },
    {
      type: "heading",
      text: "Tanlash elementlari",
    },
    {
      type: "code",
      lang: "html",
      code: `<label for="daraja">Darajangiz</label>
<select id="daraja" name="daraja">
  <option value="boshlangich">Boshlang'ich</option>
  <option value="orta">O'rta</option>
  <option value="yuqori">Yuqori</option>
</select>

<fieldset>
  <legend>Qiziqishlaringiz</legend>

  <label><input type="checkbox" name="qiziqish" value="frontend"> Frontend</label>
  <label><input type="checkbox" name="qiziqish" value="backend"> Backend</label>
</fieldset>`,
    },
    {
      type: "paragraph",
      text: "Bir-biriga bog'liq radio yoki checkbox'larni fieldset ichiga oling va legend bilan nomlang — shunda ular bitta guruh sifatida o'qiladi.",
    },
  ],
  commonMistakes: [
    "label o'rniga faqat placeholder ishlatish — foydalanuvchi yozayotganda maydon nimaligini unutadi.",
    "button elementiga type berilmasligi. Forma ichida standart qiymat submit, shuning uchun oddiy tugmaga type=\"button\" yozish kerak.",
    "name atributini unutish — bunday maydon serverga umuman yuborilmaydi.",
    "Faqat brauzer tekshiruviga ishonish. Ma'lumot serverda ham qayta tekshirilishi shart.",
  ],
  exercise: {
    title: "Aloqa formasini yarating",
    instructions:
      "Ism, email va xabar maydonlaridan iborat forma tuzing. Har bir maydonning label'i bo'lsin, ism va email majburiy bo'lsin, email uchun to'g'ri type ishlatilsin.",
    starterCode: `<form>
  <!-- Formani shu yerda yozing -->
</form>`,
    solution: `<form action="/aloqa" method="post">
  <label for="ism">Ismingiz</label>
  <input id="ism" name="ism" type="text" required>

  <label for="email">Email</label>
  <input id="email" name="email" type="email" required>

  <label for="xabar">Xabaringiz</label>
  <textarea id="xabar" name="xabar" rows="4"></textarea>

  <button type="submit">Yuborish</button>
</form>`,
    hints: [
      "Har bir input uchun label qo'shing va for atributini input id'siga tenglang.",
      "Ko'p qatorli matn uchun input emas, textarea ishlatiladi.",
      "Majburiy maydonlarga required atributini qo'shing.",
    ],
  },
  quiz: [
    {
      id: "q1",
      question: "label elementining for atributi nimaga bog'lanadi?",
      type: "single",
      answers: [
        { id: "a", text: "input elementining name atributiga" },
        { id: "b", text: "input elementining id atributiga" },
        { id: "c", text: "input elementining type atributiga" },
        { id: "d", text: "form elementining action atributiga" },
      ],
      correct: ["b"],
      explanation:
        "for atributi input elementining id qiymatiga mos kelishi kerak. name serverga yuborishda ishlatiladi, bog'lanishga aloqasi yo'q.",
    },
    {
      id: "q2",
      question: "Quyidagilardan qaysilari brauzer tekshiruvini amalga oshiradi?",
      type: "multiple",
      answers: [
        { id: "a", text: "required" },
        { id: "b", text: "placeholder" },
        { id: "c", text: "minlength" },
        { id: "d", text: "pattern" },
      ],
      correct: ["a", "c", "d"],
      explanation:
        "placeholder faqat ko'rsatma matni — u hech narsani tekshirmaydi. required, minlength va pattern esa brauzer tekshiruvini ishga tushiradi.",
    },
    {
      id: "q3",
      question:
        "Forma ichidagi <button> elementiga type yozilmasa, u submit vazifasini bajaradi.",
      type: "boolean",
      answers: [
        { id: "a", text: "To'g'ri" },
        { id: "b", text: "Noto'g'ri" },
      ],
      correct: ["a"],
      explanation:
        "Ha, standart qiymat submit. Shuning uchun formani yubormasligi kerak bo'lgan tugmalarga type=\"button\" yozish shart.",
    },
  ],
  relatedTerms: ["html", "accessibility", "dom"],
};

export const htmlCourse: Course = {
  slug: "html",
  title: "HTML asoslari",
  subtitle: "Veb-sahifa tuzilishini noldan quring",
  description:
    "HTML — har qanday veb-sahifaning skeleti. Ushbu kursda semantik teglar, formalar, jadvallar va qulaylik (accessibility) qoidalarini o'rganasiz. Kurs oxirida o'zingizning ko'p sahifali saytingizni yoza olasiz.",
  category: "Dasturlash",
  difficulty: "Boshlang'ich",
  durationHours: 12,
  accent: "from-orange-500 to-amber-500",
  objectives: [
    "Semantik HTML yozish va nima uchun kerakligini tushunish",
    "Forma tuzish va brauzer tekshiruvidan foydalanish",
    "Rasm, havola va jadvallar bilan ishlash",
    "Qulaylik (accessibility) qoidalariga amal qilish",
  ],
  prerequisites: ["Kompyuterda matn fayli yaratish va saqlashni bilish"],
  authorUsername: "mkarimova",
  reviewerUsername: "avaliyev",
  learners: 4210,
  modules: [
    {
      title: "Boshlanish",
      lessons: [
        draft({
          slug: "html-nima",
          title: "HTML nima va u qanday ishlaydi",
          intro:
            "HTML — HyperText Markup Language. Bu dasturlash tili emas, balki belgilash tili: u brauzerga sahifada nima borligini aytadi.",
          whyImportant:
            "HTML tuzilishini tushunmasdan CSS ham, JavaScript ham to'g'ri ishlamaydi — ikkalasi ham HTML ustiga quriladi.",
          body: [
            {
              type: "paragraph",
              text: "Brauzer HTML faylni o'qib, undan sahifa daraxtini (DOM) quradi. Har bir teg shu daraxtning tuguniga aylanadi.",
            },
            {
              type: "code",
              lang: "html",
              code: `<!DOCTYPE html>
<html lang="uz">
  <head>
    <meta charset="utf-8">
    <title>Mening sahifam</title>
  </head>
  <body>
    <h1>Salom, dunyo!</h1>
  </body>
</html>`,
            },
            {
              type: "note",
              text: "lang=\"uz\" atributi ekran o'quvchi dasturlarga matn o'zbek tilida ekanini aytadi.",
            },
          ],
          commonMistakes: [
            "<!DOCTYPE html> ni tushirib qoldirish — brauzer eski rejimga o'tib qoladi.",
            "charset ni ko'rsatmaslik — o'zbekcha harflar buzilib chiqadi.",
          ],
          durationMin: 10,
        }),
        draft({
          slug: "teglar-va-atributlar",
          title: "Teglar va atributlar",
          intro:
            "Teg — elementning turi, atribut esa uning qo'shimcha xususiyati. Ikkalasi birgalikda elementni to'liq tavsiflaydi.",
          whyImportant:
            "Atributlarni bilmasdan havola ham, rasm ham, forma ham yozib bo'lmaydi.",
          body: [
            {
              type: "code",
              lang: "html",
              code: `<a href="https://ilmxona.uz" target="_blank" rel="noopener">
  Ilmxona
</a>`,
            },
            {
              type: "paragraph",
              text: "Bu yerda a — teg, href, target va rel — atributlar. href havola manzilini bildiradi.",
            },
          ],
          durationMin: 9,
        }),
        draft({
          slug: "matn-elementlari",
          title: "Matn elementlari va sarlavhalar",
          intro:
            "h1 dan h6 gacha sarlavhalar, p, strong, em va ro'yxatlar — matnni tartibga soluvchi asosiy elementlar.",
          whyImportant:
            "Sarlavhalar ketma-ketligi sahifaning mundarijasini hosil qiladi. Qidiruv tizimlari ham, ekran o'quvchilar ham shunga tayanadi.",
          body: [
            {
              type: "warning",
              text: "Sarlavha darajasini o'tkazib yubormang: h1 dan keyin h3 emas, h2 kelishi kerak.",
            },
          ],
          durationMin: 11,
        }),
      ],
    },
    {
      title: "Kontent bilan ishlash",
      lessons: [
        draft({
          slug: "havolalar",
          title: "Havolalar",
          intro:
            "Havola — vebni veb qiladigan narsa. Ichki, tashqi va sahifa ichidagi havolalarni ko'rib chiqamiz.",
          whyImportant:
            "Havola matni ma'noli bo'lishi kerak: \"bu yerga bosing\" emas, balki qayerga olib borishini aytadigan matn.",
          durationMin: 8,
        }),
        draft({
          slug: "rasmlar",
          title: "Rasm va media",
          intro:
            "img, picture, video va audio elementlari. alt matni nima uchun majburiy ekanini ko'ramiz.",
          whyImportant:
            "alt matnisiz rasm ko'rmaydigan foydalanuvchi uchun sahifada bo'shliq qoladi.",
          durationMin: 12,
        }),
        draft({
          slug: "jadvallar",
          title: "Jadvallar",
          intro:
            "table, thead, tbody, th va td. Jadval faqat jadval ma'lumoti uchun — sahifa joylashuvi uchun emas.",
          whyImportant:
            "To'g'ri belgilangan jadvalni ekran o'quvchi dastur katak-katak o'qib bera oladi.",
          durationMin: 13,
        }),
      ],
    },
    {
      title: "Formalar va qulaylik",
      lessons: [
        formalar,
        draft({
          slug: "semantik-teglar",
          title: "Semantik teglar",
          intro:
            "header, nav, main, article, section, aside va footer — div o'rniga ma'noli teglar ishlatish.",
          whyImportant:
            "Semantik teglar sahifaga tuzilma beradi va qulaylikni bepul yaxshilaydi.",
          body: [
            {
              type: "table",
              headers: ["Teg", "Vazifasi"],
              rows: [
                ["header", "Sahifa yoki bo'lim sarlavhasi"],
                ["nav", "Asosiy navigatsiya havolalari"],
                ["main", "Sahifaning asosiy mazmuni (bitta bo'ladi)"],
                ["article", "Mustaqil, o'zi alohida ma'noga ega kontent"],
                ["footer", "Sahifa yoki bo'lim pastki qismi"],
              ],
            },
          ],
          durationMin: 12,
        }),
        draft({
          slug: "qulaylik-asoslari",
          title: "Qulaylik (accessibility) asoslari",
          intro:
            "Klaviatura bilan harakatlanish, fokus ko'rinishi, alt matnlar va ARIA atributlariga qisqacha kirish.",
          whyImportant:
            "Qulaylik qo'shimcha imkoniyat emas — u saytdan foydalana oladigan odamlar sonini belgilaydi.",
          durationMin: 15,
        }),
      ],
    },
  ],
};
