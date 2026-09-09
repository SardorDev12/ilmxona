import type { Metadata } from "next";
import { getAuthUser, requireProfile } from "@/lib/auth/session";
import {
  DeleteAccountForm,
  EmailForm,
  PasswordForm,
} from "@/components/settings/account-forms";
import { SettingsSection } from "@/components/settings/form-shell";

export const metadata: Metadata = {
  title: "Hisob sozlamalari",
  robots: { index: false },
};

export default async function AccountSettingsPage() {
  const profile = await requireProfile("/settings/account");
  const user = await getAuthUser();

  // Google accounts have no password to change — offering the form would
  // just produce a confusing error.
  const providers = user?.app_metadata?.providers ?? [];
  const hasPassword =
    providers.length === 0 || providers.includes("email");

  return (
    <div className="flex flex-col gap-8">
      <SettingsSection title="Email">
        <EmailForm email={user?.email ?? ""} />
      </SettingsSection>

      {hasPassword ? (
        <SettingsSection title="Parol">
          <PasswordForm />
        </SettingsSection>
      ) : (
        <SettingsSection
          title="Parol"
          description="Siz hisobga tashqi xizmat orqali kirasiz, shuning uchun parol yo'q."
        >
          <p className="text-sm text-muted-foreground">
            Kirish usuli:{" "}
            {providers.length > 0 ? providers.join(", ") : "noma'lum"}
          </p>
        </SettingsSection>
      )}

      <SettingsSection title="Hisobni o'chirish">
        <DeleteAccountForm username={profile.username} />
      </SettingsSection>
    </div>
  );
}
