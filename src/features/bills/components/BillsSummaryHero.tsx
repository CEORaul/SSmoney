"use client"

import { motion } from "motion/react"
import { CalendarClock, CheckCircle2, Wallet } from "lucide-react"

import type { getBillsSummary } from "@/features/bills/queries"
import { AnimatedNumber } from "@/components/shared/AnimatedNumber"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { fadeInUp } from "@/lib/motion"
import { formatDate, formatMonthLabel } from "@/lib/date"
import { cn } from "@/lib/utils"

export function BillsSummaryHero({
  summary,
}: {
  summary: Awaited<ReturnType<typeof getBillsSummary>>
}) {
  const monthLabel = formatMonthLabel(summary.yearMonth)
  const capitalizedMonth = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

  return (
    <motion.div initial="hidden" animate="show" variants={fadeInUp}>
      <Card className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 -z-10 size-72 rounded-full bg-primary/[0.07] blur-3xl"
        />
        <CardContent className="space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{capitalizedMonth}</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight md:text-4xl">
                Você já pagou {summary.paidCount} de {summary.totalCount}{" "}
                {summary.totalCount === 1 ? "conta" : "contas"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold tabular-nums tracking-tight text-primary md:text-4xl">
                {summary.paidPercent}%
              </p>
              <p className="text-xs text-muted-foreground">do mês pago</p>
            </div>
          </div>

          <Progress value={summary.paidPercent} />

          <div className="grid grid-cols-1 gap-6 border-t border-border/70 pt-6 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-positive/10 text-positive">
                <CheckCircle2 className="size-4" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">Valor pago</p>
                <AnimatedNumber
                  cents={summary.paidAmountCents}
                  className="block text-lg font-semibold text-positive"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Wallet className="size-4" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">Falta pagar</p>
                <AnimatedNumber
                  cents={summary.pendingAmountCents}
                  className="block text-lg font-semibold"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full",
                  summary.nextUpcoming
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <CalendarClock className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Próximo vencimento</p>
                {summary.nextUpcoming ? (
                  <p className="truncate text-lg font-semibold">
                    {summary.nextUpcoming.name}
                    <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                      {formatDate(summary.nextUpcoming.dueDate)}
                    </span>
                  </p>
                ) : (
                  <p className="text-lg font-semibold text-muted-foreground">Nenhuma</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
