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
    updatedAt: "2026-07-30",
    authorUsername: "brahimov",
    reviewerUsername: "avaliyev",
    ...l,
  };
}

export const gitCourse: Course = {
  slug: "git",
  title: "Git va versiyalarni boshqarish",
  subtitle: "Kodingiz tarixini nazorat qiling",
  description:
    "Git — jamoada ishlashning standarti. Ushbu kursda commit, branch, merge va konfliktlarni hal qilishni, hamda GitHub bilan ishlashni o'rganasiz.",
  category: "Dasturlash",
  difficulty: "Boshlang'ich",
  durationHours: 10,
  accent: "from-rose-500 to-red-600",
  objectives: [
    "Git'ning ichki mantiqini tushunish: commit, branch, HEAD",
    "Branch yaratish va o'zgarishlarni birlashtirish",
    "Merge konfliktlarini qo'rqmasdan hal qilish",
    "GitHub'da jamoa bilan ishlash jarayonini qurish",
  ],
  prerequisites: ["Terminalda asosiy buyruqlarni bilish"],
  authorUsername: "brahimov",
  reviewerUsername: "avaliyev",
  learners: 3120,
  modules: [
    {
      title: "Birinchi qadamlar",
      lessons: [
        draft({
          slug: "git-nima",
          title: "Git nima uchun kerak",
          intro:
            "Git — fayllar tarixini saqlaydigan tizim. U har bir o'zgarishni kim, qachon va nima uchun qilganini eslab qoladi.",
          whyImportant:
            "\"Ishlab turgan versiya qayerda edi?\" degan savol Git bilan bir buyruqda hal bo'ladi.",
          body: [
            {
              type: "code",
              lang: "bash",
              code: `git init                 # yangi repozitoriy
git status               # hozirgi holat
git add .                # o'zgarishlarni tayyorlash
git commit -m "Boshlangich versiya"`,
            },
            {
              type: "note",
              text: "Commit xabari nima qilganingizni emas, nima uchun qilganingizni tushuntirsin.",
            },
          ],
          durationMin: 11,
        }),
        draft({
          slug: "commit",
          title: "Commit va tarix",
          intro:
            "Commit — o'zgarishlarning saqlangan nuqtasi. git log bilan tarixni ko'rish va o'qish.",
          whyImportant:
            "Kichik va ma'noli commit'lar keyinchalik xatolik qayerdan kelganini topishni osonlashtiradi.",
          body: [
            {
              type: "code",
              lang: "bash",
              code: `git log --oneline --graph
git show <commit-hash>
git diff`,
            },
          ],
          durationMin: 13,
        }),
        draft({
          slug: "gitignore",
          title: ".gitignore",
          intro:
            "Qaysi fayllar Git nazoratiga tushmasligi kerakligini belgilash.",
          whyImportant:
            "node_modules yoki .env faylini xatoga yo'l qo'yib yuklab yuborish — eng ko'p uchraydigan va eng qimmat xatolardan biri.",
          body: [
            {
              type: "warning",
              text: "Agar maxfiy kalit bir marta commit qilingan bo'lsa, uni .gitignore'ga qo'shish yetarli emas — kalitni bekor qilib, yangisini yaratish kerak.",
            },
          ],
          durationMin: 9,
        }),
      ],
    },
    {
      title: "Branch bilan ishlash",
      lessons: [
        draft({
          slug: "branch",
          title: "Branch yaratish va almashish",
          intro:
            "Branch — tarixning parallel yo'nalishi. Har bir yangi vazifa uchun alohida branch ochiladi.",
          whyImportant:
            "Branch tufayli tugallanmagan ish asosiy kodga ta'sir qilmaydi.",
          body: [
            {
              type: "code",
              lang: "bash",
              code: `git switch -c yangi-imkoniyat   # yaratish va o'tish
git switch dev                  # mavjud branch'ga o'tish
git branch                      # ro'yxat`,
            },
          ],
          durationMin: 14,
        }),
        draft({
          slug: "merge",
          title: "Merge va konfliktlar",
          intro:
            "Ikki branch'ni birlashtirish va bir xil qatorga tegilganda yuzaga keladigan konfliktni hal qilish.",
          whyImportant:
            "Konflikt xato emas — bu Git sizdan qaysi variant to'g'ri ekanini so'rayotgani.",
          body: [
            {
              type: "code",
              lang: "bash",
              code: `git switch dev
git merge yangi-imkoniyat

# konflikt bo'lsa: fayllarni tuzatib
git add .
git commit`,
            },
          ],
          durationMin: 18,
        }),
        draft({
          slug: "rebase",
          title: "Rebase",
          intro:
            "Commit'larni boshqa asos ustiga ko'chirish va tarixni tekis saqlash.",
          whyImportant:
            "Rebase tarixni chiroyli qiladi, lekin boshqalar bilan bo'lishilgan branch'da xavfli.",
          body: [
            {
              type: "warning",
              text: "Boshqalar ishlayotgan branch'ni hech qachon rebase qilmang — ularning nusxasi buziladi.",
            },
          ],
          durationMin: 16,
        }),
      ],
    },
    {
      title: "Jamoada ishlash",
      lessons: [
        draft({
          slug: "remote",
          title: "Masofaviy repozitoriylar",
          intro: "push, pull, fetch va origin tushunchasi.",
          whyImportant:
            "Kod faqat sizning kompyuteringizda bo'lsa, u yo'qolishi mumkin.",
          body: [
            {
              type: "code",
              lang: "bash",
              code: `git remote -v
git push -u origin dev
git pull origin dev`,
            },
          ],
          durationMin: 13,
        }),
        draft({
          slug: "pull-request",
          title: "Pull request",
          intro:
            "O'zgarishlarni jamoaga taqdim etish va ko'rib chiqishdan o'tkazish jarayoni.",
          whyImportant:
            "Kod ko'rigi (code review) — xatolarni ishlab chiqarishga chiqishidan oldin ushlashning eng arzon usuli.",
          durationMin: 12,
        }),
      ],
    },
  ],
};
