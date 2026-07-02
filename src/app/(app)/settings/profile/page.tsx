import { requireUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProfileForm } from "@/features/settings/components/ProfileForm";

export default async function ProfileSettingsPage() {
  const profile = await requireUser();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Perfil"
        description="Gerencie suas informações pessoais"
      />
      <ProfileForm
        defaultValues={{
          fullName: profile.fullName ?? "",
          currency: profile.currency,
        }}
      />
    </div>
  );
}
