import type { Role } from "@prisma/client";

/**
 * Ordered from least to most privileged, per docs/PRD.md §28.
 * "Visitor" isn't stored — it's simply the absence of a session.
 */
export const ROLE_HIERARCHY = [
  "USER",
  "CONTRIBUTOR",
  "REVIEWER",
  "MODERATOR",
  "ADMIN",
] as const satisfies readonly Role[];

export function roleRank(role: Role): number {
  return ROLE_HIERARCHY.indexOf(role);
}

/** True if `role` grants at least the privileges of `required`. */
export function hasRole(role: Role, required: Role): boolean {
  return roleRank(role) >= roleRank(required);
}
