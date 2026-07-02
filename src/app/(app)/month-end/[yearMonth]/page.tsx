import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/PageHeader";
import { requireUser } from "@/lib/auth/session";
import { nextYearMonth, previousYearMonth, toYearMonth } from "@/lib/date";
import { getMonthClosing } from "@/features/month-end/queries";
import { MonthNav } from "@/features/month-end/components/MonthNav";
import { ClosingSummaryCards } from "@/features/month-end/components/ClosingSummaryCards";
import { CategoryDeltaList } from "@/features/month-end/components/CategoryDeltaList";
import { TopMovers } from "@/features/month-end/components/TopMovers";
import { AISummaryPlaceholder } from "@/features/month-end/components/AISummaryPlaceholder";

const YEAR_MONTH_PATTERN = /^\d{4}-\d{2}$/;

export default async function MonthEndPage({
  params,
}: {
  params: Promise<{ yearMonth: string }>;
}) {
  const { yearMonth } = await params;
  if (!YEAR_MONTH_PATTERN.test(yearMonth)) {
    notFound();
  }

  const profile = await requireUser();
  const closing = await getMonthClosing(yearMonth);

  const currentYearMonth = toYearMonth(new Date());
  const next = yearMonth < currentYearMonth ? nextYearMonth(yearMonth) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fechamento do Mês"
        description="Compare seus gastos e receitas com o mês anterior"
      />
      <MonthNav
        monthLabel={closing.monthLabel}
        previousYearMonth={previousYearMonth(yearMonth)}
        nextYearMonth={next}
        isClosed={closing.isClosed}
      />
      <ClosingSummaryCards
        totalIncomeCents={closing.totalIncomeCents}
        totalExpenseCents={closing.totalExpenseCents}
        totalSavingsCents={closing.totalSavingsCents}
        previous={closing.previous}
        currency={profile.currency}
      />
      <TopMovers
        topGainer={closing.topGainer}
        topShrink={closing.topShrink}
        currency={profile.currency}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <CategoryDeltaList items={closing.categoryBreakdown} currency={profile.currency} />
        <AISummaryPlaceholder />
      </div>
    </div>
  );
}
