import "server-only"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth/session"
import {
  formatMonthLabel,
  monthRange,
  previousYearMonth,
  toYearMonth,
} from "@/lib/date"
import type { MonthlySnapshot } from "@/generated/prisma/client"

export type CategoryDelta = {
  categoryId: string | null
  name: string
  color: string | null
  icon: string | null
  currentCents: number
  previousCents: number
  deltaCents: number
}

type PreviousTotals = {
  yearMonth: string
  totalIncomeCents: number
  totalExpenseCents: number
  totalSavingsCents: number
}

export type MonthClosing = {
  yearMonth: string
  monthLabel: string
  isClosed: boolean
  totalIncomeCents: number
  totalExpenseCents: number
  totalSavingsCents: number
  previous: PreviousTotals
  categoryBreakdown: CategoryDelta[]
  topGainer: CategoryDelta | null
  topShrink: CategoryDelta | null
}

type SnapshotJson = {
  items: CategoryDelta[]
  previous: PreviousTotals
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

async function getCategoryExpenseTotals(profileId: string, start: Date, end: Date) {
  const grouped = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: { profileId, type: "EXPENSE", date: { gte: start, lte: end } },
    _sum: { amountCents: true },
  })

  const map = new Map<string | null, number>()
  grouped.forEach((g) => map.set(g.categoryId, g._sum.amountCents ?? 0))
  return map
}

async function computeClosing(
  profileId: string,
  yearMonth: string
): Promise<Omit<MonthClosing, "monthLabel" | "isClosed">> {
  const { start, end } = monthRange(yearMonth)
  const prevYearMonth = previousYearMonth(yearMonth)
  const { start: prevStart, end: prevEnd } = monthRange(prevYearMonth)

  const [current, previous, currentCategoryTotals, previousCategoryTotals] = await Promise.all([
    sumByType(profileId, start, end),
    sumByType(profileId, prevStart, prevEnd),
    getCategoryExpenseTotals(profileId, start, end),
    getCategoryExpenseTotals(profileId, prevStart, prevEnd),
  ])

  const categoryIds = new Set<string>()
  currentCategoryTotals.forEach((_, id) => id && categoryIds.add(id))
  previousCategoryTotals.forEach((_, id) => id && categoryIds.add(id))

  const categories = categoryIds.size
    ? await prisma.category.findMany({ where: { id: { in: Array.from(categoryIds) } } })
    : []

  const categoryBreakdown: CategoryDelta[] = Array.from(categoryIds).map((id) => {
    const category = categories.find((c) => c.id === id)
    const currentCents = currentCategoryTotals.get(id) ?? 0
    const previousCents = previousCategoryTotals.get(id) ?? 0
    return {
      categoryId: id,
      name: category?.name ?? "Sem categoria",
      color: category?.color ?? null,
      icon: category?.icon ?? null,
      currentCents,
      previousCents,
      deltaCents: currentCents - previousCents,
    }
  })

  const uncategorizedCurrent = currentCategoryTotals.get(null) ?? 0
  const uncategorizedPrevious = previousCategoryTotals.get(null) ?? 0
  if (uncategorizedCurrent || uncategorizedPrevious) {
    categoryBreakdown.push({
      categoryId: null,
      name: "Sem categoria",
      color: null,
      icon: null,
      currentCents: uncategorizedCurrent,
      previousCents: uncategorizedPrevious,
      deltaCents: uncategorizedCurrent - uncategorizedPrevious,
    })
  }

  categoryBreakdown.sort((a, b) => b.currentCents - a.currentCents)

  const withActivity = categoryBreakdown.filter((c) => c.currentCents > 0 || c.previousCents > 0)
  const gainer = withActivity.length
    ? withActivity.reduce((max, c) => (c.deltaCents > max.deltaCents ? c : max))
    : null
  const shrinker = withActivity.length
    ? withActivity.reduce((min, c) => (c.deltaCents < min.deltaCents ? c : min))
    : null

  return {
    yearMonth,
    totalIncomeCents: current.incomeCents,
    totalExpenseCents: current.expenseCents,
    totalSavingsCents: current.incomeCents - current.expenseCents,
    previous: {
      yearMonth: prevYearMonth,
      totalIncomeCents: previous.incomeCents,
      totalExpenseCents: previous.expenseCents,
      totalSavingsCents: previous.incomeCents - previous.expenseCents,
    },
    categoryBreakdown,
    topGainer: gainer && gainer.deltaCents > 0 ? gainer : null,
    topShrink: shrinker && shrinker.deltaCents < 0 ? shrinker : null,
  }
}

function fromSnapshot(snapshot: MonthlySnapshot): Omit<MonthClosing, "monthLabel" | "isClosed"> {
  const data = snapshot.categoryBreakdown as unknown as SnapshotJson

  return {
    yearMonth: snapshot.yearMonth,
    totalIncomeCents: snapshot.totalIncomeCents,
    totalExpenseCents: snapshot.totalExpenseCents,
    totalSavingsCents: snapshot.totalSavingsCents,
    previous: data.previous,
    categoryBreakdown: data.items,
    topGainer: data.items.find((c) => c.categoryId === snapshot.topGainerCategoryId) ?? null,
    topShrink: data.items.find((c) => c.categoryId === snapshot.topShrinkCategoryId) ?? null,
  }
}

export async function getMonthClosing(yearMonth: string): Promise<MonthClosing> {
  const profile = await requireUser()
  const currentYearMonth = toYearMonth(new Date())
  const isClosed = yearMonth < currentYearMonth

  if (isClosed) {
    const cached = await prisma.monthlySnapshot.findUnique({
      where: { profileId_yearMonth: { profileId: profile.id, yearMonth } },
    })
    if (cached?.isFinalized) {
      return { ...fromSnapshot(cached), monthLabel: formatMonthLabel(yearMonth), isClosed }
    }
  }

  const computed = await computeClosing(profile.id, yearMonth)

  if (isClosed) {
    const snapshotJson: SnapshotJson = {
      items: computed.categoryBreakdown,
      previous: computed.previous,
    }

    await prisma.monthlySnapshot.upsert({
      where: { profileId_yearMonth: { profileId: profile.id, yearMonth } },
      create: {
        profileId: profile.id,
        yearMonth,
        totalIncomeCents: computed.totalIncomeCents,
        totalExpenseCents: computed.totalExpenseCents,
        totalSavingsCents: computed.totalSavingsCents,
        categoryBreakdown: snapshotJson,
        topGainerCategoryId: computed.topGainer?.categoryId ?? null,
        topShrinkCategoryId: computed.topShrink?.categoryId ?? null,
        isFinalized: true,
      },
      update: {
        totalIncomeCents: computed.totalIncomeCents,
        totalExpenseCents: computed.totalExpenseCents,
        totalSavingsCents: computed.totalSavingsCents,
        categoryBreakdown: snapshotJson,
        topGainerCategoryId: computed.topGainer?.categoryId ?? null,
        topShrinkCategoryId: computed.topShrink?.categoryId ?? null,
        isFinalized: true,
      },
    })
  }

  return { ...computed, monthLabel: formatMonthLabel(yearMonth), isClosed }
}
