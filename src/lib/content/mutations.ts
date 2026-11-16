"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile, requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { slugify, type Block, type Exercise, type QuizQuestion } from "./types";

export type ContentFormState = { error?: string; ok?: string };

/**
 * Content writes. Authorization is enforced by RLS (see 006_content.sql
 * and 007_course_review.sql), not by these functions: an author may only
 * touch their own rows, and the policies' `with check` clauses are what
 * stop a status being set to PUBLISHED by anyone but a moderator. The
 * checks here exist to give a readable message before the database
 * refuses.
 *
 * The unit of review is the course. A lesson is never submitted or
 * approved on its own from the author's side — adding one is an update
 * to its course, which is what the moderator opens and reads.
 */

export async function createCourse(
  _prev: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  const profile = await requireProfile("/contributor/courses/new");
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || title);

  if (!title) return { error: "Kurs nomi kiritilmagan." };
  if (!slug) return { error: "URL manzili bo'sh." };

  const modules = String(formData.get("modules") ?? "")
    .split("\n")
    .map((m) => m.trim())
    .filter(Boolean);

  const { data: course, error } = await supabase
    .from("courses")
    .insert({
      slug,
      title,
      subtitle: String(formData.get("subtitle") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      category: String(formData.get("category") ?? "Boshqa"),
      difficulty: String(formData.get("difficulty") ?? "Boshlang'ich"),
      duration_hours: Number(formData.get("duration_hours")) || 10,
      accent: String(formData.get("accent") ?? "from-sky-500 to-blue-600"),
      objectives: splitLines(formData.get("objectives")),
      prerequisites: splitLines(formData.get("prerequisites")),
      author_id: profile.id,
      status: "DRAFT",
    })
    .select("id, slug")
    .single<{ id: string; slug: string }>();

  if (error) {
    if (error.code === "23505") {
      return { error: "Bu URL manzili allaqachon band." };
    }
    return { error: `Saqlab bo'lmadi: ${error.message}` };
  }

  if (modules.length > 0) {
    await supabase.from("modules").insert(
      modules.map((title, position) => ({
        course_id: course.id,
        title,
        position,
      })),
    );
  }

  revalidatePath("/dashboard");
  // Straight into the workspace for this course: the next step is
  // adding a lesson, and that is what the workspace leads with.
  redirect(`/contributor/courses/${course.slug}`);
}

export async function createLesson(
  _prev: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  const profile = await requireProfile("/contributor/lessons/new");
  const supabase = await createClient();

  const courseId = String(formData.get("course_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || title);

  if (!courseId) return { error: "Kurs tanlanmagan." };
  if (!title) return { error: "Dars sarlavhasi kiritilmagan." };
  if (!slug) return { error: "URL manzili bo'sh." };

  const body = parseJson<Block[]>(formData.get("body"), []);
  const quiz = parseJson<QuizQuestion[]>(formData.get("quiz"), []);
  const exercise = parseJson<Exercise | null>(formData.get("exercise"), null);

  const { data: course } = await supabase
    .from("courses")
    .select("slug")
    .eq("id", courseId)
    .maybeSingle<{ slug: string }>();

  const position = await nextLessonPosition(supabase, courseId, formData);

  // Adding a lesson is an update to its course, so submitting it here is
  // what puts that course in the moderator's queue — there is no separate
  // lesson review step.
  const submit = formData.get("submit") === "1";

  const { error } = await supabase.from("lessons").insert({
    course_id: courseId,
    module_id: String(formData.get("module_id") ?? "") || null,
    slug,
    title,
    intro: String(formData.get("intro") ?? "").trim(),
    why_important: String(formData.get("why_important") ?? "").trim(),
    body,
    common_mistakes: splitLines(formData.get("common_mistakes")),
    exercise,
    quiz,
    related_terms: splitLines(formData.get("related_terms")),
    duration_min: Number(formData.get("duration_min")) || 10,
    position,
    author_id: profile.id,
    status: submit ? "SUBMITTED" : "DRAFT",
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Bu kursda shunday URL manzili allaqachon bor." };
    }
    return { error: `Saqlab bo'lmadi: ${error.message}` };
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin/review");
  redirect(
    course ? `/contributor/courses/${course.slug}` : "/dashboard",
  );
}

/**
 * Edit a course that has not been published yet. A published course is
 * left alone on purpose: changing it in place would alter what a
 * moderator already approved, with no second review.
 */
export async function updateCourse(
  _prev: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  await requireProfile("/dashboard");
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || title);

  if (!id) return { error: "Kurs tanlanmagan." };
  if (!title) return { error: "Kurs nomi kiritilmagan." };
  if (!slug) return { error: "URL manzili bo'sh." };

  const { data: course, error } = await supabase
    .from("courses")
    .update({
      slug,
      title,
      subtitle: String(formData.get("subtitle") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      category: String(formData.get("category") ?? "Boshqa"),
      difficulty: String(formData.get("difficulty") ?? "Boshlang'ich"),
      duration_hours: Number(formData.get("duration_hours")) || 10,
      accent: String(formData.get("accent") ?? "from-sky-500 to-blue-600"),
      objectives: splitLines(formData.get("objectives")),
      prerequisites: splitLines(formData.get("prerequisites")),
    })
    .eq("id", id)
    .select("slug")
    .maybeSingle<{ slug: string }>();

  if (error) {
    if (error.code === "23505") {
      return { error: "Bu URL manzili allaqachon band." };
    }
    return { error: `Saqlab bo'lmadi: ${error.message}` };
  }

  if (!course) {
    return {
      error:
        "Bu kursni tahrirlab bo'lmaydi — u nashr etilgan yoki sizga tegishli emas.",
    };
  }

  await syncModules(supabase, id, splitLines(formData.get("modules")));

  revalidatePath("/dashboard");
  redirect(`/contributor/courses/${course.slug}`);
}

/** Edit a lesson, optionally sending it to review in the same step. */
export async function updateLesson(
  _prev: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  await requireProfile("/dashboard");
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || title);

  if (!id) return { error: "Dars tanlanmagan." };
  if (!title) return { error: "Dars sarlavhasi kiritilmagan." };
  if (!slug) return { error: "URL manzili bo'sh." };

  const submit = formData.get("submit") === "1";

  const { data: lesson, error } = await supabase
    .from("lessons")
    .update({
      module_id: String(formData.get("module_id") ?? "") || null,
      slug,
      title,
      intro: String(formData.get("intro") ?? "").trim(),
      why_important: String(formData.get("why_important") ?? "").trim(),
      body: parseJson<Block[]>(formData.get("body"), []),
      common_mistakes: splitLines(formData.get("common_mistakes")),
      exercise: parseJson<Exercise | null>(formData.get("exercise"), null),
      quiz: parseJson<QuizQuestion[]>(formData.get("quiz"), []),
      related_terms: splitLines(formData.get("related_terms")),
      duration_min: Number(formData.get("duration_min")) || 10,
      ...(submit ? { status: "SUBMITTED", review_note: null } : {}),
    })
    .eq("id", id)
    .select("courses!inner(slug)")
    .maybeSingle<{ courses: { slug: string } }>();

  if (error) {
    if (error.code === "23505") {
      return { error: "Bu kursda shunday URL manzili allaqachon bor." };
    }
    return { error: `Saqlab bo'lmadi: ${error.message}` };
  }

  if (!lesson) {
    return {
      error:
        "Bu darsni tahrirlab bo'lmaydi — u nashr etilgan yoki ko'rib chiqilmoqda.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin/review");
  redirect(`/contributor/courses/${lesson.courses.slug}`);
}

/** Remove a lesson the author has not yet had published. */
export async function deleteLesson(
  _prev: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  await requireProfile("/dashboard");
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Dars tanlanmagan." };

  const { error, count } = await supabase
    .from("lessons")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) return { error: `O'chirib bo'lmadi: ${error.message}` };
  if (count === 0) {
    return {
      error: "O'chirib bo'lmadi — nashr etilgan darsni moderator o'chiradi.",
    };
  }

  revalidatePath("/dashboard");
  return { ok: "Dars o'chirildi." };
}

/** Move one lesson up or down in its course. */
export async function moveLesson(
  _prev: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  await requireProfile("/dashboard");
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const direction = formData.get("direction") === "up" ? -1 : 1;
  if (!id) return { error: "Dars tanlanmagan." };

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, course_id, position")
    .eq("id", id)
    .maybeSingle<{ id: string; course_id: string; position: number }>();

  if (!lesson) return { error: "Dars topilmadi." };

  const { data: siblings } = await supabase
    .from("lessons")
    .select("id, position")
    .eq("course_id", lesson.course_id)
    .order("position", { ascending: true })
    .returns<{ id: string; position: number }[]>();

  const ordered = siblings ?? [];
  const index = ordered.findIndex((l) => l.id === id);
  const target = index + direction;
  if (index === -1 || target < 0 || target >= ordered.length) return {};

  // Positions are rewritten from scratch rather than swapped: rows
  // created before this feature can share a position, and a swap between
  // two equal values would do nothing.
  [ordered[index], ordered[target]] = [ordered[target], ordered[index]];

  for (const [position, row] of ordered.entries()) {
    if (row.position === position) continue;
    await supabase.from("lessons").update({ position }).eq("id", row.id);
  }

  revalidatePath("/dashboard");
  return {};
}

/**
 * The author sends a course to review. Its unpublished lessons ride
 * along: the course is the unit of review, so an author never submits a
 * lesson by itself. For a course that is already live this submits only
 * the new lessons, leaving the published course untouched.
 */
export async function submitForReview(
  _prev: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  await requireProfile("/dashboard");
  const supabase = await createClient();

  const courseId = String(formData.get("course_id") ?? "");
  if (!courseId) return { error: "Kurs tanlanmagan." };

  const { data: course } = await supabase
    .from("courses")
    .select("id, status")
    .eq("id", courseId)
    .maybeSingle<{ id: string; status: string }>();

  if (!course) return { error: "Kurs topilmadi." };

  // Lessons first: if the course update is refused there is nothing to
  // undo, whereas submitted lessons on a live course are the whole point.
  const { error: lessonError } = await supabase
    .from("lessons")
    .update({ status: "SUBMITTED", review_note: null })
    .eq("course_id", courseId)
    .in("status", ["DRAFT", "CHANGES_REQUESTED"]);

  if (lessonError) {
    return { error: `Darslarni yuborib bo'lmadi: ${lessonError.message}` };
  }

  if (course.status !== "PUBLISHED") {
    const { error } = await supabase
      .from("courses")
      .update({ status: "SUBMITTED", review_note: null })
      .eq("id", courseId);

    if (error) return { error: `Yuborib bo'lmadi: ${error.message}` };
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin/review");
  return {
    ok:
      course.status === "PUBLISHED"
        ? "Yangilanishlar ko'rib chiqishga yuborildi."
        : "Kurs ko'rib chiqishga yuborildi.",
  };
}

/**
 * Moderator decision on a whole course. Publishing a course publishes
 * every lesson waiting inside it, which is what makes the course — not
 * the lesson — the thing that gets reviewed.
 */
export async function reviewCourse(
  _prev: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  const moderator = await requireRole("MODERATOR", "/admin/review");
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  const now = new Date().toISOString();

  if (!id) return { error: "Kurs tanlanmagan." };

  if (decision === "publish") {
    const { data: course, error } = await supabase
      .from("courses")
      .update({
        status: "PUBLISHED",
        published_at: now,
        reviewer_id: moderator.id,
        review_note: null,
      })
      .eq("id", id)
      .select("author_id, slug")
      .single<{ author_id: string; slug: string }>();

    if (error) return { error: `Nashr etib bo'lmadi: ${error.message}` };

    const { error: lessonError } = await supabase
      .from("lessons")
      .update({
        status: "PUBLISHED",
        published_at: now,
        reviewer_id: moderator.id,
        review_note: null,
      })
      .eq("course_id", id)
      .eq("status", "SUBMITTED");

    if (lessonError) {
      return { error: `Darslarni nashr etib bo'lmadi: ${lessonError.message}` };
    }

    await promoteToCreator(course.author_id);

    revalidatePath("/", "layout");
    return { ok: "Kurs va uning yangi darslari nashr etildi." };
  }

  if (decision === "changes") {
    if (!note) {
      return { error: "O'zgartirish so'ralganda izoh yozilishi kerak." };
    }

    const { data: course } = await supabase
      .from("courses")
      .select("status")
      .eq("id", id)
      .maybeSingle<{ status: string }>();

    // A live course stays published — sending it back would pull it off
    // the site over an unrelated new lesson. The note lands on the
    // lessons that are actually waiting.
    const target =
      course?.status === "PUBLISHED"
        ? supabase
            .from("lessons")
            .update({
              status: "CHANGES_REQUESTED",
              reviewer_id: moderator.id,
              review_note: note,
            })
            .eq("course_id", id)
            .eq("status", "SUBMITTED")
        : supabase
            .from("courses")
            .update({
              status: "CHANGES_REQUESTED",
              reviewer_id: moderator.id,
              review_note: note,
            })
            .eq("id", id);

    const { error } = await target;
    if (error) return { error: `Saqlab bo'lmadi: ${error.message}` };

    revalidatePath("/admin/review");
    revalidatePath("/dashboard");
    return { ok: "Muallifga qaytarildi." };
  }

  return { error: "Noma'lum qaror." };
}

/**
 * Per-lesson decision, taken from inside the course review page. Same
 * two outcomes, scoped to one lesson so a moderator can accept a course
 * without accepting every lesson in it.
 */
export async function reviewLesson(
  _prev: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  const moderator = await requireRole("MODERATOR", "/admin/review");
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!id) return { error: "Dars tanlanmagan." };

  if (decision === "publish") {
    const { data: lesson, error } = await supabase
      .from("lessons")
      .update({
        status: "PUBLISHED",
        published_at: new Date().toISOString(),
        reviewer_id: moderator.id,
        review_note: null,
      })
      .eq("id", id)
      .select("author_id")
      .single<{ author_id: string }>();

    if (error) return { error: `Nashr etib bo'lmadi: ${error.message}` };

    await promoteToCreator(lesson.author_id);

    revalidatePath("/", "layout");
    return { ok: "Dars nashr etildi." };
  }

  if (decision === "changes") {
    if (!note) {
      return { error: "O'zgartirish so'ralganda izoh yozilishi kerak." };
    }

    const { error } = await supabase
      .from("lessons")
      .update({
        status: "CHANGES_REQUESTED",
        reviewer_id: moderator.id,
        review_note: note,
      })
      .eq("id", id);

    if (error) return { error: `Saqlab bo'lmadi: ${error.message}` };

    revalidatePath("/admin/review");
    revalidatePath("/dashboard");
    return { ok: "Dars muallifga qaytarildi." };
  }

  return { error: "Noma'lum qaror." };
}

/**
 * Deleting a course takes its modules and lessons with it (on delete
 * cascade). RLS allows this for a moderator on any course, and for an
 * author only while their own course is still a draft.
 */
export async function deleteCourse(
  _prev: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  await requireProfile("/dashboard");
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Kurs tanlanmagan." };

  // The typed name is the confirmation: deleting a published course
  // removes every lesson under it, and there is no undo.
  const confirmation = String(formData.get("confirm") ?? "").trim();
  const expected = String(formData.get("expected") ?? "").trim();
  if (expected && confirmation !== expected) {
    return { error: "Tasdiqlash uchun kurs nomini aynan kiriting." };
  }

  const { error, count } = await supabase
    .from("courses")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) return { error: `O'chirib bo'lmadi: ${error.message}` };
  if (count === 0) {
    return { error: "O'chirishga ruxsat yo'q yoki kurs allaqachon o'chirilgan." };
  }

  revalidatePath("/", "layout");
  redirect("/admin/review");
}

/**
 * A USER whose content has just been published becomes a CREATOR. Needs
 * the service role because `role` is excluded from the column grant — the
 * same reason role changes in the admin panel go that way.
 */
async function promoteToCreator(userId: string) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  if (!admin) return;

  await admin
    .from("profiles")
    .update({ role: "CREATOR" })
    .eq("id", userId)
    .eq("role", "USER");
}

function splitLines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseJson<T>(value: FormDataEntryValue | null, fallback: T): T {
  try {
    const raw = String(value ?? "");
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * New lessons go to the end of the course. Asking the database rather
 * than trusting a number from the form keeps the order stable when two
 * lessons are written in different tabs.
 */
async function nextLessonPosition(
  supabase: Awaited<ReturnType<typeof createClient>>,
  courseId: string,
  formData: FormData,
): Promise<number> {
  const explicit = formData.get("position");
  if (explicit !== null && String(explicit) !== "") return Number(explicit);

  const { data } = await supabase
    .from("lessons")
    .select("position")
    .eq("course_id", courseId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle<{ position: number }>();

  return data ? data.position + 1 : 0;
}

/**
 * Modules are edited as a list of titles. Matching by title keeps the
 * module ids — and therefore the lessons filed under them — intact when
 * the author only reorders or adds one.
 */
async function syncModules(
  supabase: Awaited<ReturnType<typeof createClient>>,
  courseId: string,
  titles: string[],
) {
  const { data: existing } = await supabase
    .from("modules")
    .select("id, title, position")
    .eq("course_id", courseId)
    .returns<{ id: string; title: string; position: number }[]>();

  const current = existing ?? [];
  const keep = new Set<string>();

  for (const [position, title] of titles.entries()) {
    const match = current.find((m) => m.title === title && !keep.has(m.id));

    if (match) {
      keep.add(match.id);
      if (match.position !== position) {
        await supabase.from("modules").update({ position }).eq("id", match.id);
      }
      continue;
    }

    const { data: created } = await supabase
      .from("modules")
      .insert({ course_id: courseId, title, position })
      .select("id")
      .maybeSingle<{ id: string }>();

    if (created) keep.add(created.id);
  }

  // Dropping a module leaves its lessons in the course, unfiled, rather
  // than deleting them with it.
  const removed = current.filter((m) => !keep.has(m.id)).map((m) => m.id);
  if (removed.length > 0) {
    await supabase
      .from("lessons")
      .update({ module_id: null })
      .in("module_id", removed);
    await supabase.from("modules").delete().in("id", removed);
  }
}
