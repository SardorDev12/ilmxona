/**
 * Ordered from least to most privileged. "Visitor" isn't stored — it's
 * simply the absence of a session. Mirrors the `role` enum in
 * supabase/sql/005_four_roles.sql.
 *
 * Reading is open to everyone, signed in or not. Everything that writes
 * — drafting content, submitting it for review, commenting — needs a
 * session, which is USER. Creating is deliberately not gated above that:
 * anyone can draft and submit, and review is what filters quality.
 */
export const ROLE_HIERARCHY = [
  "USER",
  "CREATOR",
  "MODERATOR",
  "ADMIN",
] as const;

export type Role = (typeof ROLE_HIERARCHY)[number];

export const ROLE_LABELS: Record<Role, string> = {
  USER: "Foydalanuvchi",
  CREATOR: "Muallif",
  MODERATOR: "Moderator",
  ADMIN: "Administrator",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  USER: "O'qiydi, mashq qiladi va kontent yuborishi mumkin.",
  CREATOR: "Kontenti nashr etilgan muallif.",
  MODERATOR: "Yuborilgan kontentni ko'rib chiqadi, shikoyatlarni hal qiladi.",
  ADMIN: "To'liq huquq, jumladan rollarni tayinlash.",
};

export function roleRank(role: Role): number {
  return ROLE_HIERARCHY.indexOf(role);
}

/** True if `role` grants at least the privileges of `required`. */
export function hasRole(role: Role, required: Role): boolean {
  return roleRank(role) >= roleRank(required);
}
