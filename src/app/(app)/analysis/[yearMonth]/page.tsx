import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/PageHeader";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { requireUser } from "@/lib/auth/session";
import { getMonthlyAnalysis } from "@/features/analysis/queries";
import { AnalysisMonthNav } from "@/features/analysis/components/AnalysisMonthNav";
import { AnalysisSummaryCards } from "@/features/analysis/components/AnalysisSummaryCards";
import { InsightsList } from "@/features/analysis/components/InsightsList";
import { MonthlyHistoryList } from "@/features/analysis/components/MonthlyHistoryList";
import { ClosingSummaryCards } from "@/features/month-end/components/ClosingSummaryCards";
import { TopMovers } from "@/features/month-end/components/TopMovers";
import { CategoryDeltaList } from "@/features/month-end/components/CategoryDeltaList";
import { MonthlyEvolutionChart } from "@/features/dashboard/components/MonthlyEvolutionChart";

const YEAR_MONTH_PATTERN = /^\d{4}-\d{2}$/;

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ yearMonth: string }>;
}) {
  const { yearMonth } = await params;
  if (!YEAR_MONTH_PATTERN.test(yearMonth)) {
    notFound();
  }

  const profile = await requireUser();
  const analysis = await getMonthlyAnalysis(yearMonth);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Análise mensal"
        description="Um relatório completo do seu mês, com comparações e insights automáticos"
      />
      <AnalysisMonthNav
        yearMonth={analysis.yearMonth}
        monthLabel={analysis.monthLabel}
        nextYearMonth={analysis.nextYearMonth}
        isClosed={analysis.isClosed}
      />

      <AnalysisSummaryCards
        balanceCents={analysis.balanceCents}
        incomeCents={analysis.closing.totalIncomeCents}
        expenseCents={analysis.closing.totalExpenseCents}
        savingsCents={analysis.closing.totalSavingsCents}
        savingsRatePercent={analysis.savingsRatePercent}
        currency={profile.currency}
      />

      <ScrollReveal className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Comparação com o mês anterior</h2>
        <ClosingSummaryCards
          totalIncomeCents={analysis.closing.totalIncomeCents}
          totalExpenseCents={analysis.closing.totalExpenseCents}
          totalSavingsCents={analysis.closing.totalSavingsCents}
          previous={analysis.closing.previous}
          currency={profile.currency}
        />
        <TopMovers
          topGainer={analysis.closing.topGainer}
          topShrink={analysis.closing.topShrink}
          currency={profile.currency}
        />
      </ScrollReveal>

      <ScrollReveal>
        <MonthlyEvolutionChart data={analysis.evolution} currency={profile.currency} />
      </ScrollReveal>

      <ScrollReveal>
        <CategoryDeltaList items={analysis.topCategories} currency={profile.currency} />
      </ScrollReveal>

      <ScrollReveal className="grid gap-4 lg:grid-cols-2">
        <InsightsList insights={analysis.insights} />
        <MonthlyHistoryList
          months={analysis.evolution}
          activeYearMonth={analysis.yearMonth}
          currency={profile.currency}
        />
      </ScrollReveal>
    </div>
  );
}
