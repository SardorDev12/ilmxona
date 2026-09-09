"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile, requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { slugify, type Block, type Exercise, type QuizQuestion } from "./types";

export type ContentFormState = { error?: string; ok?: string };

/**
 * Content writes. Authorization is enforced by RLS (see 006_content.sql),
 * not by these functions: an author may only touch their own rows, and
 * the policies' `with check` clauses are what stop a status being set to
 * PUBLISHED by anyone but a moderator. The checks here exist to give a
 * readable message before the database refuses.
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
    status: "DRAFT",
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Bu kursda shunday URL manzili allaqachon bor." };
    }
    return { error: `Saqlab bo'lmadi: ${error.message}` };
  }

  revalidatePath("/dashboard");
  redirect(course ? `/courses/${course.slug}` : "/dashboard");
}

/** Author sends their draft to review. Shaped as a form action. */
export async function submitForReview(
  _prev: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  await requireProfile("/dashboard");
  const supabase = await createClient();

  const table = String(formData.get("table") ?? "") as "courses" | "lessons";
  const id = String(formData.get("id") ?? "");

  if (table !== "courses" && table !== "lessons") {
    return { error: "Noma'lum kontent turi." };
  }

  const { error } = await supabase
    .from(table)
    .update({ status: "SUBMITTED", review_note: null })
    .eq("id", id);

  if (error) return { error: `Yuborib bo'lmadi: ${error.message}` };

  revalidatePath("/dashboard");
  revalidatePath("/admin/review");
  return { ok: "Ko'rib chiqishga yuborildi." };
}

/** Moderator decision. Publishing is reachable only from here. */
export async function reviewContent(
  _prev: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  const moderator = await requireRole("MODERATOR", "/admin/review");
  const supabase = await createClient();

  const table = String(formData.get("table") ?? "") as "courses" | "lessons";
  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (table !== "courses" && table !== "lessons") {
    return { error: "Noma'lum kontent turi." };
  }

  if (decision === "publish") {
    const { data: row, error } = await supabase
      .from(table)
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

    // Publishing someone's work is what makes them a creator. Done here
    // rather than by hand so the role reflects reality.
    await promoteToCreator(row.author_id);

    revalidatePath("/", "layout");
    return { ok: "Nashr etildi." };
  }

  if (decision === "changes") {
    if (!note) {
      return { error: "O'zgartirish so'ralganda izoh yozilishi kerak." };
    }

    const { error } = await supabase
      .from(table)
      .update({
        status: "CHANGES_REQUESTED",
        reviewer_id: moderator.id,
        review_note: note,
      })
      .eq("id", id);

    if (error) return { error: `Saqlab bo'lmadi: ${error.message}` };

    revalidatePath("/admin/review");
    return { ok: "Muallifga qaytarildi." };
  }

  return { error: "Noma'lum qaror." };
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
