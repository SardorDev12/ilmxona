"use client";

import { useActionState } from "react";
import { setUserRole, type AdminFormState } from "@/app/admin/actions";
import { ROLE_HIERARCHY, ROLE_LABELS, type Role } from "@/lib/auth/roles";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function RoleForm({
  userId,
  currentRole,
  isSelf,
}: {
  userId: string;
  currentRole: Role;
  isSelf: boolean;
}) {
  const [state, formAction] = useActionState<AdminFormState, FormData>(
    setUserRole,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="user_id" value={userId} />
      <div className="flex items-center gap-2">
        <Select
          name="role"
          defaultValue={currentRole}
          aria-label="Rol"
          className="h-9 w-40 cursor-pointer"
          // An admin demoting themselves can lock everyone out; the
          // action refuses it too.
          disabled={isSelf}
        >
          {ROLE_HIERARCHY.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </Select>
        <Button type="submit" size="sm" variant="outline" disabled={isSelf}>
          Saqlash
        </Button>
      </div>

      {(state.error || state.ok) && (
        <p
          role="status"
          className={
            "text-xs " +
            (state.error ? "text-destructive" : "text-muted-foreground")
          }
        >
          {state.error ?? state.ok}
        </p>
      )}
    </form>
  );
}
