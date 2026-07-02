import { Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { listGoals } from "@/features/goals/queries";
import { GoalFormDialog } from "@/features/goals/components/GoalFormDialog";
import { GoalCard } from "@/features/goals/components/GoalCard";

export default async function GoalsPage() {
  const goals = await listGoals();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Metas"
        description="Defina objetivos e acompanhe seu progresso"
        actions={
          <GoalFormDialog
            trigger={
              <Button>
                <Plus className="size-4" />
                Nova meta
              </Button>
            }
          />
        }
      />
      {goals.length === 0 ? (
        <EmptyState
          title="Nenhuma meta ainda"
          description="Crie uma meta para começar a guardar dinheiro para o que importa."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  );
}
