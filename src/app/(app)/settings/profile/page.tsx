import { requireUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProfileForm } from "@/features/settings/components/ProfileForm";
import { FeedbackDialog } from "@/features/feedback/components/FeedbackDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

      <Card className="max-w-md">
        <CardContent className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium">💬 Enviar feedback</p>
          <FeedbackDialog trigger={<Button variant="outline">Enviar feedback</Button>} />
        </CardContent>
      </Card>
    </div>
  );
}
