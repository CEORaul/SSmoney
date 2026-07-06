import Link from "next/link"
import { History } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/money"
import { cn } from "@/lib/utils"

type HistoryMonth = {
  yearMonth: string
  label: string
  incomeCents: number
  expenseCents: number
}

/** Reuses the same rolling window fetched for the evolution chart — no extra query. */
export function MonthlyHistoryList({
  months,
  activeYearMonth,
  currency,
}: {
  months: HistoryMonth[]
  activeYearMonth: string
  currency: string
}) {
  const reversed = [...months].reverse()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="size-4" />
          Histórico mensal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-1">
          {reversed.map((month) => {
            const isActive = month.yearMonth === activeYearMonth
            const savingsCents = month.incomeCents - month.expenseCents
            return (
              <li key={month.yearMonth}>
                <Link
                  href={`/analysis/${month.yearMonth}`}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground/80 hover:bg-muted"
                  )}
                >
                  <span className="font-medium capitalize">{month.label}</span>
                  <span
                    className={cn(
                      "font-mono text-xs tabular-nums",
                      savingsCents >= 0 ? "text-positive" : "text-negative"
                    )}
                  >
                    {savingsCents >= 0 ? "+" : "-"}
                    {formatCurrency(Math.abs(savingsCents), currency)}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
