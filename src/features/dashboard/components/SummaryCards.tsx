"use client"

import { motion } from "motion/react"
import { ArrowDownRight, ArrowUpRight, PiggyBank, Wallet } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/money"
import { fadeInUp, staggerContainer } from "@/lib/motion"

const TONE_CLASS = {
  neutral: "text-foreground",
  positive: "text-emerald-600 dark:text-emerald-400",
  negative: "text-red-600 dark:text-red-400",
} as const

const ICON_TONE_CLASS = {
  neutral: "bg-muted text-muted-foreground",
  positive: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  negative: "bg-red-500/10 text-red-600 dark:text-red-400",
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
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid gap-4 lg:grid-cols-3"
    >
      <motion.div variants={fadeInUp} className="lg:col-span-1">
        <Card className="h-full">
          <CardContent className="flex h-full flex-col justify-between gap-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Saldo</p>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Wallet className="size-4" />
              </span>
            </div>
            <p className="text-4xl font-semibold tracking-tighter tabular-nums md:text-5xl">
              {formatCurrency(balanceCents, currency)}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
        {secondary.map(({ label, value, icon: Icon, tone }) => (
          <motion.div key={label} variants={fadeInUp}>
            <Card>
              <CardContent className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p
                    className={cn(
                      "mt-2 text-2xl font-semibold tracking-tight tabular-nums",
                      TONE_CLASS[tone]
                    )}
                  >
                    {formatCurrency(value, currency)}
                  </p>
                </div>
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    ICON_TONE_CLASS[tone]
                  )}
                >
                  <Icon className="size-4" />
                </span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
