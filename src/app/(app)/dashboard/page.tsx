import { requireUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/PageHeader";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { getDashboardData } from "@/features/dashboard/queries";
import { SummaryCards } from "@/features/dashboard/components/SummaryCards";
import { CategoryBreakdownChart } from "@/features/dashboard/components/CategoryBreakdownChart";
import { MonthlyEvolutionChart } from "@/features/dashboard/components/MonthlyEvolutionChart";
import { UpcomingBills } from "@/features/dashboard/components/UpcomingBills";
import { getNetWorthSummary } from "@/features/net-worth/queries";
import { NetWorthCard } from "@/features/net-worth/components/NetWorthCard";
import { AIInsightTeaser } from "@/features/dashboard/components/AIInsightTeaser";

export default async function DashboardPage() {
  const profile = await requireUser();
  const [data, netWorth] = await Promise.all([getDashboardData(), getNetWorthSummary()]);

  return (
    <div className="space-y-10">
      <PageHeader
        title={`Olá, ${profile.fullName?.split(" ")[0] ?? "por aqui"}`}
        description={`Resumo de ${data.monthLabel}`}
      />

      <SummaryCards
        balanceCents={data.balanceCents}
        monthIncomeCents={data.monthIncomeCents}
        monthExpenseCents={data.monthExpenseCents}
        monthSavingsCents={data.monthSavingsCents}
        currency={data.currency}
      />

      <ScrollReveal className="grid gap-4 lg:grid-cols-2">
        <MonthlyEvolutionChart data={data.evolution} currency={data.currency} />
        <CategoryBreakdownChart data={data.categoryBreakdown} currency={data.currency} />
      </ScrollReveal>

      <ScrollReveal className="grid gap-4 lg:grid-cols-3">
        <UpcomingBills bills={data.upcomingBills} />
        <NetWorthCard
          totalCents={netWorth.totalCents}
          hasAssets={netWorth.hasAssets}
          currency={netWorth.currency}
        />
        <AIInsightTeaser />
      </ScrollReveal>
    </div>
  );
}
