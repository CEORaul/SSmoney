import { ArrowDownRight, ArrowUpRight, PiggyBank, Wallet } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/money"

const TONE_CLASS = {
  neutral: "text-foreground",
  positive: "text-emerald-600 dark:text-emerald-400",
  negative: "text-red-600 dark:text-red-400",
} as const

export function SummaryCards({
  balanceCents,
  monthIncomeCents,
  monthExpenseCents,
  monthSavingsCents,
  currency,
}: {
  balanceCents: number
  monthIncomeCents: number
  monthExpenseCents: number
  monthSavingsCents: number
  currency: string
}) {
  const cards = [
    { label: "Saldo", value: balanceCents, icon: Wallet, tone: "neutral" as const },
    { label: "Receitas do mês", value: monthIncomeCents, icon: ArrowUpRight, tone: "positive" as const },
    { label: "Despesas do mês", value: monthExpenseCents, icon: ArrowDownRight, tone: "negative" as const },
    {
      label: "Economia do mês",
      value: monthSavingsCents,
      icon: PiggyBank,
      tone: monthSavingsCents >= 0 ? ("positive" as const) : ("negative" as const),
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, tone }) => (
        <Card key={label}>
          <CardContent className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className={cn("mt-1 text-2xl font-semibold", TONE_CLASS[tone])}>
                {formatCurrency(value, currency)}
              </p>
            </div>
            <Icon className="size-4 shrink-0 text-muted-foreground" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
