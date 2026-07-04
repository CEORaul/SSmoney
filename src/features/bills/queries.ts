import "server-only"

import {
  addDays,
  addWeeks,
  endOfMonth,
  endOfWeek,
  isBefore,
  isSameDay,
  startOfDay,
  startOfMonth,
} from "date-fns"

import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth/session"
import { toYearMonth } from "@/lib/date"
import { getEffectiveStatus, type EffectiveBillStatus } from "@/features/bills/service"
import type { BillFiltersInput } from "@/features/bills/schemas"

const PAGE_SIZE = 20
const SCHEDULED_THRESHOLD_DAYS = 7

export type BillWithDetails = Prisma.BillGetPayload<{ include: { category: true } }> & {
  effectiveStatus: EffectiveBillStatus
}

function statusWhere(status: BillFiltersInput["status"], today: Date): Prisma.BillWhereInput {
  const todayStart = startOfDay(today)

  switch (status) {
    case "PAID":
      return { status: "PAID" }
    case "CANCELLED":
      return { status: "CANCELLED" }
    case "OVERDUE":
      return { status: "PENDING", dueDate: { lt: todayStart } }
    case "SCHEDULED":
      return { status: "PENDING", dueDate: { gt: addDays(todayStart, SCHEDULED_THRESHOLD_DAYS) } }
    case "PENDING":
      return {
        status: "PENDING",
        dueDate: { gte: todayStart, lte: addDays(todayStart, SCHEDULED_THRESHOLD_DAYS) },
      }
    default:
      return {}
  }
}

export async function listBills(filters: BillFiltersInput) {
  const profile = await requireUser()
  const today = new Date()

  const where: Prisma.BillWhereInput = {
    profileId: profile.id,
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.paymentMethod ? { paymentMethod: filters.paymentMethod } : {}),
    ...statusWhere(filters.status, today),
    ...(filters.search
      ? {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
            { note: { contains: filters.search, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.bill.findMany({
      where,
      include: { category: true },
      orderBy: { dueDate: "asc" },
      skip: (filters.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.bill.count({ where }),
  ])

  return {
    items: items.map((bill) => ({ ...bill, effectiveStatus: getEffectiveStatus(bill, today) })),
    total,
    pageSize: PAGE_SIZE,
    page: filters.page,
  }
}

export type MonthBillFilters = Omit<BillFiltersInput, "page">

/**
 * Month-scoped listing for the per-month Bills view — unlike `listBills`,
 * this filters by `dueDate` within the given month and returns everything
 * matching (no pagination: a single month's bills are a small, bounded set,
 * so there's no need for the flat-list page-size trick `listBills` uses).
 */
export async function listBillsForMonth(yearMonth: string, filters: MonthBillFilters = {}) {
  const profile = await requireUser()
  const today = new Date()
  const monthDate = new Date(`${yearMonth}-01T00:00:00`)
  const start = startOfMonth(monthDate)
  const end = endOfMonth(monthDate)

  const where: Prisma.BillWhereInput = {
    profileId: profile.id,
    // AND (not spread) because statusWhere() can itself return a `dueDate`
    // condition (OVERDUE/SCHEDULED/PENDING) — spreading it after the month
    // range would silently overwrite the range instead of intersecting it.
    AND: [{ dueDate: { gte: start, lte: end } }, filters.status ? statusWhere(filters.status, today) : {}],
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.paymentMethod ? { paymentMethod: filters.paymentMethod } : {}),
    ...(filters.search
      ? {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
            { note: { contains: filters.search, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  const items = await prisma.bill.findMany({
    where,
    include: { category: true },
    orderBy: { dueDate: "asc" },
  })

  return items.map((bill) => ({ ...bill, effectiveStatus: getEffectiveStatus(bill, today) }))
}

export async function getBill(id: string) {
  const profile = await requireUser()

  const bill = await prisma.bill.findFirst({
    where: { id, profileId: profile.id },
    include: { category: true },
  })
  if (!bill) return null

  return { ...bill, effectiveStatus: getEffectiveStatus(bill) }
}

export type TimelineBucket = "hoje" | "amanha" | "estaSemana" | "proximaSemana" | "depois"

function bucketFor(dueDate: Date, today: Date): TimelineBucket {
  const todayStart = startOfDay(today)
  const tomorrow = addDays(todayStart, 1)
  const endThisWeek = endOfWeek(todayStart, { weekStartsOn: 1 })
  const endNextWeek = endOfWeek(addWeeks(todayStart, 1), { weekStartsOn: 1 })
  const due = startOfDay(dueDate)

  if (isBefore(due, todayStart) || isSameDay(due, todayStart)) return "hoje"
  if (isSameDay(due, tomorrow)) return "amanha"
  if (!isBefore(endThisWeek, due)) return "estaSemana"
  if (!isBefore(endNextWeek, due)) return "proximaSemana"
  return "depois"
}

/**
 * Without `yearMonth`, behaves exactly as before (all-time PENDING bills) —
 * this is the shape `lib/ai/context.ts` already relies on. With `yearMonth`,
 * scopes the timeline to that month's `dueDate` range for the per-month
 * Bills view.
 */
export async function getBillsTimeline(yearMonth?: string) {
  const profile = await requireUser()
  const today = new Date()

  const monthRange = yearMonth
    ? { gte: startOfMonth(new Date(`${yearMonth}-01T00:00:00`)), lte: endOfMonth(new Date(`${yearMonth}-01T00:00:00`)) }
    : undefined

  const bills = await prisma.bill.findMany({
    where: {
      profileId: profile.id,
      status: "PENDING",
      ...(monthRange ? { dueDate: monthRange } : {}),
    },
    include: { category: true },
    orderBy: { dueDate: "asc" },
  })

  const buckets: Record<TimelineBucket, (typeof bills)[number][]> = {
    hoje: [],
    amanha: [],
    estaSemana: [],
    proximaSemana: [],
    depois: [],
  }

  for (const bill of bills) {
    buckets[bucketFor(bill.dueDate, today)].push(bill)
  }

  return buckets
}

export async function getBillsSummary(yearMonth: string = toYearMonth(new Date())) {
  const profile = await requireUser()
  const monthDate = new Date(`${yearMonth}-01T00:00:00`)
  const start = startOfMonth(monthDate)
  const end = endOfMonth(monthDate)

  const [paid, pending, nextUpcoming] = await Promise.all([
    prisma.bill.aggregate({
      where: { profileId: profile.id, status: "PAID", dueDate: { gte: start, lte: end } },
      _sum: { amountCents: true },
      _count: true,
    }),
    prisma.bill.aggregate({
      where: { profileId: profile.id, status: "PENDING", dueDate: { gte: start, lte: end } },
      _sum: { amountCents: true },
      _count: true,
    }),
    prisma.bill.findFirst({
      where: { profileId: profile.id, status: "PENDING" },
      orderBy: { dueDate: "asc" },
      include: { category: true },
    }),
  ])

  const paidCount = paid._count
  const totalCount = paid._count + pending._count

  return {
    yearMonth,
    paidCount,
    totalCount,
    paidPercent: totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0,
    paidAmountCents: paid._sum.amountCents ?? 0,
    pendingAmountCents: pending._sum.amountCents ?? 0,
    nextUpcoming: nextUpcoming
      ? { ...nextUpcoming, effectiveStatus: getEffectiveStatus(nextUpcoming) as EffectiveBillStatus }
      : null,
  }
}
