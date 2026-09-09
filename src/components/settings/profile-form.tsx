"use client";

import { useActionState, useState } from "react";
import type { Profile } from "@/lib/auth/session";
import { updateProfile, type FormState } from "@/app/settings/actions";
import { Input, Textarea, Field } from "@/components/ui/input";
import { Avatar } from "@/components/content/cards";
import { FormMessage, SubmitButton } from "./form-shell";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction] = useActionState<FormState, FormData>(
    updateProfile,
    {},
  );

  // Mirrored so the public URL preview updates as the field is typed.
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio ?? "");

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormMessage state={state} />

      <div className="flex items-center gap-4">
        <Avatar name={profile.display_name ?? profile.username} size={56} />
        <div className="text-sm text-muted-foreground">
          Avatar hozircha havola orqali beriladi. Google orqali kirganda u
          avtomatik to&apos;ldiriladi.
        </div>
      </div>

      <Field
        label="Foydalanuvchi nomi"
        htmlFor="username"
        hint={`Umumiy sahifangiz: /u/${username || "..."}`}
      >
        <Input
          id="username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          required
          minLength={3}
          maxLength={30}
        />
      </Field>

      <Field
        label="Ismingiz"
        htmlFor="display_name"
        hint="Saytda ko'rinadigan ism. Bo'sh qoldirsangiz foydalanuvchi nomi ko'rsatiladi."
      >
        <Input
          id="display_name"
          name="display_name"
          defaultValue={profile.display_name ?? ""}
          maxLength={80}
        />
      </Field>

      <Field
        label="Bio"
        htmlFor="bio"
        hint={`${bio.length}/500 belgi`}
      >
        <Textarea
          id="bio"
          name="bio"
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
        />
      </Field>

      <Field label="Avatar havolasi" htmlFor="avatar_url">
        <Input
          id="avatar_url"
          name="avatar_url"
          type="url"
          inputMode="url"
          placeholder="https://..."
          defaultValue={profile.avatar_url ?? ""}
        />
      </Field>

      <div>
        <SubmitButton>Saqlash</SubmitButton>
      </div>
    </form>
  );
}
