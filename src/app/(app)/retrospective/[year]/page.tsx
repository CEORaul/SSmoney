import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/PageHeader";
import { requireUser } from "@/lib/auth/session";
import { getYearRetrospective } from "@/features/retrospective/queries";
import { RetrospectiveNav } from "@/features/retrospective/components/RetrospectiveNav";
import { RetrospectiveSummaryCards } from "@/features/retrospective/components/RetrospectiveSummaryCards";
import { ShareCardPlaceholder } from "@/features/retrospective/components/ShareCardPlaceholder";
import { MonthlyEvolutionChart } from "@/features/dashboard/components/MonthlyEvolutionChart";

const YEAR_PATTERN = /^\d{4}$/;

export default async function RetrospectivePage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year: yearParam } = await params;
  if (!YEAR_PATTERN.test(yearParam)) {
    notFound();
  }
  const year = Number(yearParam);

  const profile = await requireUser();
  const retrospective = await getYearRetrospective(year);

  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Retrospectiva SS"
        description="Veja como foi o seu ano financeiro"
      />
      <RetrospectiveNav year={year} hasNext={year < currentYear} />
      <RetrospectiveSummaryCards
        months={retrospective.months}
        registeredCount={retrospective.registeredCount}
        bestMonth={retrospective.bestMonth}
        highestExpenseMonth={retrospective.highestExpenseMonth}
        currency={profile.currency}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <MonthlyEvolutionChart
          data={retrospective.months.map((m) => ({
            yearMonth: m.yearMonth,
            label: m.shortLabel,
            incomeCents: m.totalIncomeCents,
            expenseCents: m.totalExpenseCents,
          }))}
          currency={profile.currency}
        />
        <ShareCardPlaceholder />
      </div>
    </div>
  );
}
