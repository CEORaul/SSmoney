import "server-only"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth/session"
import {
  formatMonthLabel,
  monthRange,
  previousYearMonth,
  toYearMonth,
} from "@/lib/date"

const EVOLUTION_MONTHS = 6
const UPCOMING_LIMIT = 5

async function sumByType(profileId: string, start?: Date, end?: Date) {
  const grouped = await prisma.transaction.groupBy({
    by: ["type"],
    where: {
      profileId,
      ...(start && end ? { date: { gte: start, lte: end } } : {}),
    },
    _sum: { amountCents: true },
  })

  const incomeCents = grouped.find((g) => g.type === "INCOME")?._sum.amountCents ?? 0
  const expenseCents = grouped.find((g) => g.type === "EXPENSE")?._sum.amountCents ?? 0
  return { incomeCents, expenseCents }
}

async function getMonthlyEvolution(profileId: string, currentYearMonth: string) {
  const months: string[] = []
  let cursor = currentYearMonth
  for (let i = 0; i < EVOLUTION_MONTHS; i++) {
    months.unshift(cursor)
    cursor = previousYearMonth(cursor)
  }

  return Promise.all(
    months.map(async (yearMonth) => {
      const { start, end } = monthRange(yearMonth)
      const { incomeCents, expenseCents } = await sumByType(profileId, start, end)
      return { yearMonth, label: formatMonthLabel(yearMonth), incomeCents, expenseCents }
    })
  )
}

async function getCategoryBreakdown(profileId: string, start: Date, end: Date) {
  const grouped = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: { profileId, type: "EXPENSE", date: { gte: start, lte: end } },
    _sum: { amountCents: true },
  })

  const categoryIds = grouped
    .map((g) => g.categoryId)
    .filter((id): id is string => id !== null)

  const categories = categoryIds.length
    ? await prisma.category.findMany({ where: { id: { in: categoryIds } } })
    : []

  return grouped
    .map((g) => {
      const category = categories.find((c) => c.id === g.categoryId)
      return {
        categoryId: g.categoryId,
        name: category?.name ?? "Sem categoria",
        color: category?.color ?? null,
        amountCents: g._sum.amountCents ?? 0,
      }
    })
    .filter((c) => c.amountCents > 0)
    .sort((a, b) => b.amountCents - a.amountCents)
}

export async function getDashboardData(yearMonth: string = toYearMonth(new Date())) {
  const profile = await requireUser()
  const { start, end } = monthRange(yearMonth)

  const [allTime, month, categoryBreakdown, upcomingBills, evolution] = await Promise.all([
    sumByType(profile.id),
    sumByType(profile.id, start, end),
    getCategoryBreakdown(profile.id, start, end),
    prisma.transaction.findMany({
      where: { profileId: profile.id, isPaid: false, dueDate: { not: null } },
      orderBy: { dueDate: "asc" },
      take: UPCOMING_LIMIT,
      include: { category: true },
    }),
    getMonthlyEvolution(profile.id, yearMonth),
  ])

  return {
    yearMonth,
    monthLabel: formatMonthLabel(yearMonth),
    currency: profile.currency,
    balanceCents: allTime.incomeCents - allTime.expenseCents,
    monthIncomeCents: month.incomeCents,
    monthExpenseCents: month.expenseCents,
    monthSavingsCents: month.incomeCents - month.expenseCents,
    categoryBreakdown,
    upcomingBills,
    evolution,
  }
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>
