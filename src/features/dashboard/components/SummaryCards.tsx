"use client"

import { motion } from "motion/react"
import { ArrowDownRight, ArrowUpRight, PiggyBank, Wallet } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { AnimatedNumber } from "@/components/shared/AnimatedNumber"
import { cn } from "@/lib/utils"
import { fadeInUp } from "@/lib/motion"

const TONE_CLASS = {
  positive: "text-positive",
  negative: "text-negative",
} as const

const ICON_TONE_CLASS = {
  positive: "bg-positive/10 text-positive",
  negative: "bg-negative/10 text-negative",
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
  const secondary = [
    {
      label: "Receitas do mês",
      value: monthIncomeCents,
      icon: ArrowUpRight,
      tone: "positive" as const,
    },
    {
      label: "Despesas do mês",
      value: monthExpenseCents,
      icon: ArrowDownRight,
      tone: "negative" as const,
    },
    {
      label: "Economia do mês",
      value: monthSavingsCents,
      icon: PiggyBank,
      tone: monthSavingsCents >= 0 ? ("positive" as const) : ("negative" as const),
    },
  ]

  return (
    <motion.div initial="hidden" animate="show" variants={fadeInUp}>
      <Card className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 -z-10 size-72 rounded-full bg-primary/[0.07] blur-3xl"
        />
        <CardContent className="space-y-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Saldo</p>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Wallet className="size-4" />
            </span>
          </div>

          <AnimatedNumber
            cents={balanceCents}
            currency={currency}
            className="block text-5xl font-bold md:text-6xl"
          />

          <div className="grid grid-cols-1 gap-6 border-t border-border/70 pt-6 sm:grid-cols-3">
            {secondary.map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    ICON_TONE_CLASS[tone]
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <AnimatedNumber
                    cents={value}
                    currency={currency}
                    className={cn("block text-lg font-semibold", TONE_CLASS[tone])}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
