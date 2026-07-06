import Link from "next/link";
import { Plus, Tags } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { listCategories, listAllCategories } from "@/features/categories/queries";
import { ManageCategoriesDialog } from "@/features/categories/components/ManageCategoriesDialog";
import { listTransactions } from "@/features/transactions/queries";
import { transactionFiltersSchema } from "@/features/transactions/schemas";
import { TransactionFilters } from "@/features/transactions/components/TransactionFilters";
import { TransactionFormDialog } from "@/features/transactions/components/TransactionFormDialog";
import { TransactionTable } from "@/features/transactions/components/TransactionTable";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const filters = transactionFiltersSchema.parse({
    search: params.search,
    type: params.type,
    categoryId: params.categoryId,
    page: params.page,
  });

  const [categories, allCategories, { items, total, pageSize, page }] = await Promise.all([
    listCategories(),
    listAllCategories(),
    listTransactions(filters),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transações"
        description="Registre e acompanhe suas receitas e despesas"
        actions={
          <div className="flex items-center gap-2">
            <ManageCategoriesDialog
              categories={allCategories}
              trigger={
                <Button variant="outline">
                  <Tags className="size-4" />
                  Gerenciar categorias
                </Button>
              }
            />
            <TransactionFormDialog
              categories={categories}
              allCategories={allCategories}
              trigger={
                <Button>
                  <Plus className="size-4" />
                  Nova transação
                </Button>
              }
            />
          </div>
        }
      />
      <TransactionFilters categories={categories} />
      <TransactionTable transactions={items} categories={categories} allCategories={allCategories} />
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            {page <= 1 ? (
              <Button variant="outline" size="sm" disabled>
                Anterior
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href={{ query: { ...params, page: String(page - 1) } }}>
                  Anterior
                </Link>
              </Button>
            )}
            {page >= totalPages ? (
              <Button variant="outline" size="sm" disabled>
                Próxima
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href={{ query: { ...params, page: String(page + 1) } }}>
                  Próxima
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
