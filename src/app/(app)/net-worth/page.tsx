import { Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { requireUser } from "@/lib/auth/session";
import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";
import { listAssets } from "@/features/net-worth/queries";
import { ASSET_TYPES_ORDER } from "@/features/net-worth/asset-types";
import { AssetFormDialog } from "@/features/net-worth/components/AssetFormDialog";
import { AssetGroup } from "@/features/net-worth/components/AssetGroup";

export default async function NetWorthPage() {
  const profile = await requireUser();
  const assets = await listAssets();

  const total = assets.reduce(
    (sum, a) => sum + (a.type === "DEBT" ? -a.valueCents : a.valueCents),
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patrimônio"
        description="Registre seus ativos e acompanhe seu patrimônio líquido"
        actions={
          <AssetFormDialog
            trigger={
              <Button>
                <Plus className="size-4" />
                Novo ativo
              </Button>
            }
          />
        }
      />

      <Card>
        <CardContent className="space-y-1">
          <p className="text-sm text-muted-foreground">Patrimônio líquido</p>
          <p
            className={cn(
              "text-3xl font-semibold",
              total < 0 && "text-red-600 dark:text-red-400"
            )}
          >
            {formatCurrency(total, profile.currency)}
          </p>
        </CardContent>
      </Card>

      {assets.length === 0 ? (
        <EmptyState
          title="Nenhum ativo cadastrado"
          description="Adicione seus ativos e dívidas manualmente para ver seu patrimônio líquido."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {ASSET_TYPES_ORDER.map((type) => {
            const items = assets.filter((a) => a.type === type);
            if (items.length === 0) return null;
            return (
              <AssetGroup key={type} type={type} assets={items} currency={profile.currency} />
            );
          })}
        </div>
      )}
    </div>
  );
}
