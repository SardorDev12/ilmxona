"use client";

import { useActionState, useState } from "react";
import {
  deleteAccount,
  updateEmail,
  updatePassword,
  type FormState,
} from "@/app/settings/actions";
import { Input, Field } from "@/components/ui/input";
import { FormMessage, SubmitButton } from "./form-shell";

export function EmailForm({ email }: { email: string }) {
  const [state, formAction] = useActionState<FormState, FormData>(
    updateEmail,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormMessage state={state} />
      <Field
        label="Email"
        htmlFor="email"
        hint="O'zgartirsangiz, yangi manzilga tasdiqlash havolasi yuboriladi."
      >
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={email}
          required
        />
      </Field>
      <div>
        <SubmitButton>Emailni yangilash</SubmitButton>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction] = useActionState<FormState, FormData>(
    updatePassword,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormMessage state={state} />
      <Field label="Yangi parol" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
        />
      </Field>
      <Field label="Parolni takrorlang" htmlFor="confirm">
        <Input
          id="confirm"
          name="confirm"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
        />
      </Field>
      <div>
        <SubmitButton>Parolni yangilash</SubmitButton>
      </div>
    </form>
  );
}

export function DeleteAccountForm({ username }: { username: string }) {
  const [state, formAction] = useActionState<FormState, FormData>(
    deleteAccount,
    {},
  );
  const [confirmation, setConfirmation] = useState("");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormMessage state={state} />

      <p className="text-sm text-muted-foreground">
        Hisobingiz va unga bog&apos;liq barcha ma&apos;lumotlar butunlay
        o&apos;chiriladi. Bu amalni ortga qaytarib bo&apos;lmaydi.
      </p>

      <Field
        label="Tasdiqlash"
        htmlFor="confirm_username"
        hint={`Davom etish uchun "${username}" deb yozing.`}
      >
        <Input
          id="confirm_username"
          name="confirm_username"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          autoComplete="off"
        />
      </Field>

      <div>
        {/* Disabled until the typed name matches, so the button cannot be
            hit by reflex. The action re-checks server-side regardless —
            this is a guard rail, not the authorization. */}
        <SubmitButton
          variant="destructive"
          disabled={confirmation !== username}
        >
          Hisobni o&apos;chirish
        </SubmitButton>
      </div>
    </form>
  );
}
