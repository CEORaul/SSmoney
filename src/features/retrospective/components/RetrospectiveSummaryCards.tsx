import { CalendarCheck, TrendingDown, Trophy } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/money"
import type { MonthSummary } from "@/features/retrospective/queries"

export function RetrospectiveSummaryCards({
  months,
  registeredCount,
  bestMonth,
  highestExpenseMonth,
  currency,
}: {
  months: MonthSummary[]
  registeredCount: number
  bestMonth: MonthSummary | null
  highestExpenseMonth: MonthSummary | null
  currency: string
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">Meses registrados</p>
            <CalendarCheck className="size-4 shrink-0 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold">{registeredCount} de 12</p>
          <div className="flex gap-1">
            {months.map((m) => (
              <span
                key={m.yearMonth}
                title={m.monthLabel}
                className={cn(
                  "h-2 flex-1 rounded-full",
                  m.hasActivity ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">Melhor mês</p>
            <Trophy className="size-4 shrink-0 text-muted-foreground" />
          </div>
          {bestMonth ? (
            <>
              <p className="text-2xl font-semibold capitalize">{bestMonth.monthLabel}</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                {formatCurrency(bestMonth.totalSavingsCents, currency)} economizados
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Sem dados suficientes</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">Maior gasto</p>
            <TrendingDown className="size-4 shrink-0 text-muted-foreground" />
          </div>
          {highestExpenseMonth ? (
            <>
              <p className="text-2xl font-semibold capitalize">{highestExpenseMonth.monthLabel}</p>
              <p className="text-sm text-red-600 dark:text-red-400">
                {formatCurrency(highestExpenseMonth.totalExpenseCents, currency)} em despesas
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Sem dados suficientes</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
