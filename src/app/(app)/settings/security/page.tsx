import { PageHeader } from "@/components/layout/PageHeader";
import { SecurityForm } from "@/features/settings/components/SecurityForm";

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Segurança"
        description="Atualize sua senha de acesso"
      />
      <SecurityForm />
    </div>
  );
}
