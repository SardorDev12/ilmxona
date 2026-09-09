"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type FormState = { error?: string; ok?: string };

/**
 * Usernames appear in public URLs (/u/<username>), so they are restricted
 * to characters that survive a URL untouched. Lowercase only, to avoid
 * two accounts differing solely by case.
 */
const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{2,29}$/;

export async function updateProfile(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const profile = await requireProfile("/settings");
  const supabase = await createClient();

  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();
  const displayName = String(formData.get("display_name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const avatarUrl = String(formData.get("avatar_url") ?? "").trim();

  if (!USERNAME_PATTERN.test(username)) {
    return {
      error:
        "Foydalanuvchi nomi 3–30 ta belgidan iborat bo'lishi va faqat kichik harflar, raqamlar, nuqta, tire yoki pastki chiziqdan tashkil topishi kerak.",
    };
  }

  if (bio.length > 500) {
    return { error: "Bio 500 ta belgidan oshmasligi kerak." };
  }

  if (avatarUrl && !/^https:\/\/\S+$/.test(avatarUrl)) {
    return { error: "Avatar havolasi https:// bilan boshlanishi kerak." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      display_name: displayName || null,
      bio: bio || null,
      avatar_url: avatarUrl || null,
    })
    .eq("id", profile.id);

  if (error) {
    // 23505 is unique_violation — the only constraint a user can trip here.
    if (error.code === "23505") {
      return { error: "Bu foydalanuvchi nomi allaqachon band." };
    }
    return { error: `Saqlab bo'lmadi: ${error.message}` };
  }

  // The header renders the display name, so the whole layout is stale.
  revalidatePath("/", "layout");
  return { ok: "Profil saqlandi." };
}

export async function updatePassword(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireProfile("/settings/account");
  const supabase = await createClient();

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    return { error: "Parol kamida 8 ta belgidan iborat bo'lishi kerak." };
  }
  if (password !== confirm) {
    return { error: "Parollar mos kelmadi." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  return { ok: "Parol yangilandi." };
}

export async function updateEmail(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireProfile("/settings/account");
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  if (!email.includes("@")) {
    return { error: "To'g'ri email manzilini kiriting." };
  }

  const { error } = await supabase.auth.updateUser({ email });
  if (error) return { error: error.message };

  return {
    ok: "Tasdiqlash havolasi yangi manzilga yuborildi. Havolani bosmaguningizcha eski manzil amal qiladi.",
  };
}

/**
 * Account deletion (docs/PRD.md §8). Removing an auth user requires the
 * service role — a signed-in user cannot delete themselves through the
 * public API — so this needs SUPABASE_SERVICE_ROLE_KEY set as a Worker
 * secret. The profiles row goes with it via `on delete cascade`.
 */
export async function deleteAccount(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const profile = await requireProfile("/settings/account");

  // Typing the username is the confirmation step; deletion is final.
  const confirmation = String(formData.get("confirm_username") ?? "").trim();
  if (confirmation !== profile.username) {
    return {
      error: "Tasdiqlash uchun foydalanuvchi nomingizni aniq kiriting.",
    };
  }

  const admin = createAdminClient();
  if (!admin) {
    return {
      error:
        "Hisobni o'chirish sozlanmagan: SUPABASE_SERVICE_ROLE_KEY kiritilmagan.",
    };
  }

  const { error } = await admin.auth.admin.deleteUser(profile.id);
  if (error) return { error: `Hisobni o'chirib bo'lmadi: ${error.message}` };

  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/");
}
