import { requireUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/PageHeader";
import { getDashboardData } from "@/features/dashboard/queries";
import { SummaryCards } from "@/features/dashboard/components/SummaryCards";
import { CategoryBreakdownChart } from "@/features/dashboard/components/CategoryBreakdownChart";
import { MonthlyEvolutionChart } from "@/features/dashboard/components/MonthlyEvolutionChart";
import { UpcomingBills } from "@/features/dashboard/components/UpcomingBills";
import { NetWorthPlaceholder } from "@/features/dashboard/components/NetWorthPlaceholder";

export default async function DashboardPage() {
  const profile = await requireUser();
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
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

      <div className="grid gap-4 lg:grid-cols-2">
        <MonthlyEvolutionChart data={data.evolution} currency={data.currency} />
        <CategoryBreakdownChart data={data.categoryBreakdown} currency={data.currency} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <UpcomingBills bills={data.upcomingBills} />
        <NetWorthPlaceholder />
      </div>
    </div>
  );
}
