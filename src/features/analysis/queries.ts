import "server-only"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth/session"
import { formatCurrency } from "@/lib/money"
import { nextYearMonth, toYearMonth } from "@/lib/date"
import { getMonthClosing, type MonthClosing } from "@/features/month-end/queries"
import { getMonthlyEvolution } from "@/features/dashboard/queries"

const TOP_CATEGORIES_LIMIT = 5

/** All-time cumulative balance as of the end of a given month — mirrors the
 * all-time sum in features/dashboard/queries.ts's getDashboardData, scoped
 * to a historical cutoff instead of "now" so past months show the balance
 * they actually had at the time. */
async function getBalanceAsOf(profileId: string, end: Date) {
  const grouped = await prisma.transaction.groupBy({
    by: ["type"],
    where: { profileId, date: { lte: end } },
    _sum: { amountCents: true },
  })

  const incomeCents = grouped.find((g) => g.type === "INCOME")?._sum.amountCents ?? 0
  const expenseCents = grouped.find((g) => g.type === "EXPENSE")?._sum.amountCents ?? 0
  return incomeCents - expenseCents
}

export type Insight = { text: string; tone: "positive" | "negative" | "neutral" }

function buildInsights({
  closing,
  isBestInWindow,
  currency,
}: {
  closing: MonthClosing
  isBestInWindow: boolean
  currency: string
}): Insight[] {
  const insights: Insight[] = []
  const topCategory = closing.categoryBreakdown[0]

  if (topCategory && topCategory.currentCents > 0) {
    insights.push({ text: `${topCategory.name} foi sua maior despesa este mês.`, tone: "neutral" })
  }

  if (closing.previous.totalExpenseCents > 0) {
    const deltaPercent =
      ((closing.totalExpenseCents - closing.previous.totalExpenseCents) /
        closing.previous.totalExpenseCents) *
      100
    if (Math.round(deltaPercent) !== 0) {
      const isReduction = deltaPercent < 0
      insights.push({
        text: `Você gastou ${Math.abs(Math.round(deltaPercent))}% ${isReduction ? "menos" : "mais"} do que no mês passado.`,
        tone: isReduction ? "positive" : "negative",
      })
    }
  }

  if (isBestInWindow && closing.totalSavingsCents > 0) {
    insights.push({ text: "Este foi o seu melhor mês entre os últimos analisados.", tone: "positive" })
  }

  if (closing.totalSavingsCents > 0) {
    insights.push({
      text: `Você economizou ${formatCurrency(closing.totalSavingsCents, currency)} este mês.`,
      tone: "positive",
    })
  } else if (closing.totalSavingsCents < 0) {
    insights.push({
      text: `Você gastou ${formatCurrency(Math.abs(closing.totalSavingsCents), currency)} a mais do que recebeu este mês.`,
      tone: "negative",
    })
  }

  return insights
}

export type MonthlyAnalysis = {
  yearMonth: string
  monthLabel: string
  isClosed: boolean
  closing: MonthClosing
  balanceCents: number
  savingsRatePercent: number | null
  topCategories: MonthClosing["categoryBreakdown"]
  evolution: Awaited<ReturnType<typeof getMonthlyEvolution>>
  insights: Insight[]
  nextYearMonth: string | null
}

export async function getMonthlyAnalysis(yearMonth: string): Promise<MonthlyAnalysis> {
  const profile = await requireUser()
  const currentYearMonth = toYearMonth(new Date())

  const [closing, evolution] = await Promise.all([
    getMonthClosing(yearMonth),
    getMonthlyEvolution(profile.id, yearMonth),
  ])

  const monthEnd = new Date(
    Number(yearMonth.slice(0, 4)),
    Number(yearMonth.slice(5, 7)),
    0,
    23,
    59,
    59
  )
  const balanceCents = await getBalanceAsOf(profile.id, monthEnd)

  const savingsRatePercent =
    closing.totalIncomeCents > 0
      ? Math.round((closing.totalSavingsCents / closing.totalIncomeCents) * 100)
      : null

  const evolutionSavings = evolution.map((m) => m.incomeCents - m.expenseCents)
  const hasAnyActivity = evolution.some((m) => m.incomeCents > 0 || m.expenseCents > 0)
  const isBestInWindow =
    hasAnyActivity && closing.totalSavingsCents === Math.max(...evolutionSavings)

  const insights = buildInsights({ closing, isBestInWindow, currency: profile.currency })

  return {
    yearMonth,
    monthLabel: closing.monthLabel,
    isClosed: closing.isClosed,
    closing,
    balanceCents,
    savingsRatePercent,
    topCategories: closing.categoryBreakdown.slice(0, TOP_CATEGORIES_LIMIT),
    evolution,
    insights,
    nextYearMonth: yearMonth < currentYearMonth ? nextYearMonth(yearMonth) : null,
  }
}
