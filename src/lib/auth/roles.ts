/**
 * Ordered from least to most privileged, per docs/PRD.md §28.
 * "Visitor" isn't stored — it's simply the absence of a session.
 * Mirrors the `role` enum in supabase/sql/001_profiles.sql.
 */
export const ROLE_HIERARCHY = [
  "USER",
  "CONTRIBUTOR",
  "REVIEWER",
  "MODERATOR",
  "ADMIN",
] as const;

export type Role = (typeof ROLE_HIERARCHY)[number];

export function roleRank(role: Role): number {
  return ROLE_HIERARCHY.indexOf(role);
}

/** True if `role` grants at least the privileges of `required`. */
export function hasRole(role: Role, required: Role): boolean {
  return roleRank(role) >= roleRank(required);
}
