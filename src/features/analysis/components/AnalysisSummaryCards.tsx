import { ArrowDownRight, ArrowUpRight, PiggyBank, Wallet, Percent } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { AnimatedNumber } from "@/components/shared/AnimatedNumber"
import { cn } from "@/lib/utils"

const TONE_CLASS = {
  positive: "text-positive",
  negative: "text-negative",
  neutral: "text-foreground",
} as const

/** Plain current-month totals — no comparison here, that's ClosingSummaryCards' job. */
export function AnalysisSummaryCards({
  balanceCents,
  incomeCents,
  expenseCents,
  savingsCents,
  savingsRatePercent,
  currency,
}: {
  balanceCents: number
  incomeCents: number
  expenseCents: number
  savingsCents: number
  savingsRatePercent: number | null
  currency: string
}) {
  const cards = [
    { label: "Saldo", value: balanceCents, icon: Wallet, tone: "neutral" as const },
    { label: "Receitas", value: incomeCents, icon: ArrowUpRight, tone: "positive" as const },
    { label: "Despesas", value: expenseCents, icon: ArrowDownRight, tone: "negative" as const },
    {
      label: "Economia",
      value: savingsCents,
      icon: PiggyBank,
      tone: savingsCents >= 0 ? ("positive" as const) : ("negative" as const),
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map(({ label, value, icon: Icon, tone }) => (
        <Card key={label}>
          <CardContent className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon className="size-4 shrink-0 text-muted-foreground" />
            </div>
            <AnimatedNumber
              cents={value}
              currency={currency}
              className={cn("block text-2xl font-bold", TONE_CLASS[tone])}
            />
          </CardContent>
        </Card>
      ))}
      <Card>
        <CardContent className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-muted-foreground">% economizado</p>
            <Percent className="size-4 shrink-0 text-muted-foreground" />
          </div>
          <p
            className={cn(
              "text-2xl font-bold tabular-nums",
              savingsRatePercent === null
                ? "text-muted-foreground"
                : savingsRatePercent >= 0
                  ? "text-positive"
                  : "text-negative"
            )}
          >
            {savingsRatePercent === null ? "—" : `${savingsRatePercent}%`}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
