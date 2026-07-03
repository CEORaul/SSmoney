import { ArrowDownRight, ArrowUpRight, Minus, PiggyBank, TrendingDown, TrendingUp } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { AnimatedNumber } from "@/components/shared/AnimatedNumber"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/money"

function DeltaBadge({
  deltaCents,
  positiveIsGood,
  currency,
}: {
  deltaCents: number
  positiveIsGood: boolean
  currency: string
}) {
  if (deltaCents === 0) {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="size-3" />
        sem variação
      </span>
    )
  }

  const isGood = positiveIsGood ? deltaCents > 0 : deltaCents < 0
  const Icon = deltaCents > 0 ? TrendingUp : TrendingDown

  return (
    <span
      className={cn(
        "flex items-center gap-1 text-xs",
        isGood ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
      )}
    >
      <Icon className="size-3" />
      {deltaCents > 0 ? "+" : "-"}
      {formatCurrency(Math.abs(deltaCents), currency)} vs. mês anterior
    </span>
  )
}

export function ClosingSummaryCards({
  totalIncomeCents,
  totalExpenseCents,
  totalSavingsCents,
  previous,
  currency,
}: {
  totalIncomeCents: number
  totalExpenseCents: number
  totalSavingsCents: number
  previous: { totalIncomeCents: number; totalExpenseCents: number; totalSavingsCents: number }
  currency: string
}) {
  const cards = [
    {
      label: "Receitas",
      value: totalIncomeCents,
      delta: totalIncomeCents - previous.totalIncomeCents,
      positiveIsGood: true,
      icon: ArrowUpRight,
    },
    {
      label: "Despesas",
      value: totalExpenseCents,
      delta: totalExpenseCents - previous.totalExpenseCents,
      positiveIsGood: false,
      icon: ArrowDownRight,
    },
    {
      label: "Economia",
      value: totalSavingsCents,
      delta: totalSavingsCents - previous.totalSavingsCents,
      positiveIsGood: true,
      icon: PiggyBank,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map(({ label, value, delta, positiveIsGood, icon: Icon }) => (
        <Card key={label}>
          <CardContent className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon className="size-4 shrink-0 text-muted-foreground" />
            </div>
            <AnimatedNumber
              cents={value}
              currency={currency}
              className="block text-3xl font-semibold"
            />
            <DeltaBadge deltaCents={delta} positiveIsGood={positiveIsGood} currency={currency} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
