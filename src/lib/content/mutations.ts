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
  // The author can read their own draft, so the course page is
  // the natural place to land — with a "add a lesson" call to action.
  redirect(`/courses/${course.slug}`);
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
    position: Number(formData.get("position")) || 0,
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
  redirect(course ? `/courses/${course.slug}` : "/dashboard");
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
