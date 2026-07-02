import { Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { listAllCategories } from "@/features/categories/queries";
import { CategoryFormDialog } from "@/features/categories/components/CategoryFormDialog";
import { CategoryGroup } from "@/features/categories/components/CategoryGroup";

export default async function CategoriesPage() {
  const categories = await listAllCategories();
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");
  const incomeCategories = categories.filter((c) => c.type === "INCOME");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorias"
        description="Organize suas receitas e despesas por categoria"
        actions={
          <CategoryFormDialog
            trigger={
              <Button>
                <Plus className="size-4" />
                Nova categoria
              </Button>
            }
          />
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <CategoryGroup title="Despesas" categories={expenseCategories} />
        <CategoryGroup title="Receitas" categories={incomeCategories} />
      </div>
    </div>
  );
}
