"use client";

import { useFormStatus } from "react-dom";
import type { FormState } from "@/app/settings/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function SubmitButton({
  children,
  variant = "primary",
  disabled = false,
}: {
  children: React.ReactNode;
  variant?: "primary" | "destructive";
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant={variant} disabled={pending || disabled}>
      {pending ? "Saqlanmoqda..." : children}
    </Button>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (!state.error && !state.ok) return null;

  return (
    <p
      role="status"
      className={
        "rounded-md px-3 py-2 text-sm " +
        (state.error
          ? "bg-destructive/10 text-foreground"
          : "bg-accent/10 text-foreground")
      }
    >
      {state.error ?? state.ok}
    </p>
  );
}

export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-1 text-lg font-semibold">{title}</h2>
      {description && (
        <p className="mb-3 text-sm text-muted-foreground">{description}</p>
      )}
      <Card>
        <CardContent className="p-5">{children}</CardContent>
      </Card>
    </section>
  );
}
