import Link from "next/link";
import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth/session";
import { ProfileForm } from "@/components/settings/profile-form";
import { SettingsSection } from "@/components/settings/form-shell";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/auth/roles";

export const metadata: Metadata = {
  title: "Profil sozlamalari",
  robots: { index: false },
};

export default async function ProfileSettingsPage() {
  const profile = await requireProfile("/settings");

  return (
    <div className="flex flex-col gap-8">
      <SettingsSection
        title="Profil"
        description="Bu ma'lumotlar umumiy sahifangizda ko'rinadi."
      >
        <ProfileForm profile={profile} />
      </SettingsSection>

      <SettingsSection title="Hisob holati">
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Rol</dt>
            <dd>
              <Badge variant="primary">{ROLE_LABELS[profile.role]}</Badge>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Ro&apos;yxatdan o&apos;tgan</dt>
            <dd>{new Date(profile.created_at).toLocaleDateString("uz")}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Umumiy sahifa</dt>
            <dd>
              <Link
                href={`/u/${profile.username}`}
                className="text-primary hover:underline"
              >
                /u/{profile.username}
              </Link>
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-muted-foreground">
          Rolni faqat administrator o&apos;zgartira oladi.
        </p>
      </SettingsSection>
    </div>
  );
}
