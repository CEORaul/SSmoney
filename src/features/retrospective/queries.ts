import "server-only"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth/session"
import { formatMonthLabel, formatMonthShortLabel, monthRange } from "@/lib/date"

export type MonthSummary = {
  yearMonth: string
  monthLabel: string
  shortLabel: string
  totalIncomeCents: number
  totalExpenseCents: number
  totalSavingsCents: number
  hasActivity: boolean
}

export type YearRetrospective = {
  year: number
  months: MonthSummary[]
  registeredCount: number
  bestMonth: MonthSummary | null
  highestExpenseMonth: MonthSummary | null
}

async function sumByType(profileId: string, start: Date, end: Date) {
  const grouped = await prisma.transaction.groupBy({
    by: ["type"],
    where: { profileId, date: { gte: start, lte: end } },
    _sum: { amountCents: true },
  })

  const incomeCents = grouped.find((g) => g.type === "INCOME")?._sum.amountCents ?? 0
  const expenseCents = grouped.find((g) => g.type === "EXPENSE")?._sum.amountCents ?? 0
  return { incomeCents, expenseCents }
}

async function getMonthSummary(profileId: string, yearMonth: string): Promise<MonthSummary> {
  const cached = await prisma.monthlySnapshot.findUnique({
    where: { profileId_yearMonth: { profileId, yearMonth } },
  })

  let totals: { incomeCents: number; expenseCents: number }
  if (cached?.isFinalized) {
    totals = { incomeCents: cached.totalIncomeCents, expenseCents: cached.totalExpenseCents }
  } else {
    const { start, end } = monthRange(yearMonth)
    totals = await sumByType(profileId, start, end)
  }

  return {
    yearMonth,
    monthLabel: formatMonthLabel(yearMonth),
    shortLabel: formatMonthShortLabel(yearMonth),
    totalIncomeCents: totals.incomeCents,
    totalExpenseCents: totals.expenseCents,
    totalSavingsCents: totals.incomeCents - totals.expenseCents,
    hasActivity: totals.incomeCents > 0 || totals.expenseCents > 0,
  }
}

export async function getYearRetrospective(year: number): Promise<YearRetrospective> {
  const profile = await requireUser()

  const months = Array.from(
    { length: 12 },
    (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`
  )

  const summaries = await Promise.all(
    months.map((yearMonth) => getMonthSummary(profile.id, yearMonth))
  )

  const registered = summaries.filter((m) => m.hasActivity)

  const bestMonth = registered.length
    ? registered.reduce((best, m) => (m.totalSavingsCents > best.totalSavingsCents ? m : best))
    : null

  const highestExpenseMonth = registered.length
    ? registered.reduce((max, m) => (m.totalExpenseCents > max.totalExpenseCents ? m : max))
    : null

  return {
    year,
    months: summaries,
    registeredCount: registered.length,
    bestMonth,
    highestExpenseMonth,
  }
}
