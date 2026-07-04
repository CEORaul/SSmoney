import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { formatMonthLabel, nextYearMonth, previousYearMonth } from "@/lib/date";
import { listCategories } from "@/features/categories/queries";
import { listBillsForMonth, getBillsSummary } from "@/features/bills/queries";
import { billFiltersSchema } from "@/features/bills/schemas";
import { BillFilters } from "@/features/bills/components/BillFilters";
import { BillFormDialog } from "@/features/bills/components/BillFormDialog";
import { BillList } from "@/features/bills/components/BillList";
import { BillsSummaryHero } from "@/features/bills/components/BillsSummaryHero";
import { BillsMonthNav } from "@/features/bills/components/BillsMonthNav";
import { Plus } from "lucide-react";

const YEAR_MONTH_PATTERN = /^\d{4}-\d{2}$/;

export default async function BillsPage({
  params,
  searchParams,
}: {
  params: Promise<{ yearMonth: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { yearMonth } = await params;
  if (!YEAR_MONTH_PATTERN.test(yearMonth)) {
    notFound();
  }

  const query = await searchParams;
  const { page: _page, ...filters } = billFiltersSchema.parse({
    search: query.search,
    status: query.status,
    type: query.type,
    categoryId: query.categoryId,
    paymentMethod: query.paymentMethod,
  });

  const [categories, bills, summary] = await Promise.all([
    listCategories(),
    listBillsForMonth(yearMonth, filters),
    getBillsSummary(yearMonth),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Contas a Pagar"
        description="Acompanhe, organize e nunca perca um vencimento"
        actions={
          <BillFormDialog
            categories={categories}
            trigger={
              <Button>
                <Plus className="size-4" />
                Nova conta
              </Button>
            }
          />
        }
      />

      <BillsMonthNav
        monthLabel={formatMonthLabel(yearMonth)}
        previousYearMonth={previousYearMonth(yearMonth)}
        nextYearMonth={nextYearMonth(yearMonth)}
      />

      <BillsSummaryHero summary={summary} />

      <div className="space-y-6">
        <BillFilters categories={categories} />
        <BillList bills={bills} categories={categories} />
      </div>
    </div>
  );
}
