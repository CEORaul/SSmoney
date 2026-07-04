import { addMonths, addWeeks, addYears, getDaysInMonth, setDate, startOfDay } from "date-fns"

import type { RecurrenceFrequency } from "@/generated/prisma/client"

const LOOKAHEAD_BY_FREQUENCY: Record<RecurrenceFrequency, number> = {
  WEEKLY: 8,
  MONTHLY: 6,
  YEARLY: 2,
  CUSTOM: 1,
}

/** Even split in cents; any remainder goes to the last installment. */
export function splitInstallments(totalCents: number, count: number): number[] {
  const base = Math.floor(totalCents / count)
  const remainder = totalCents - base * count
  return Array.from({ length: count }, (_, i) => (i === count - 1 ? base + remainder : base))
}

/** How many upcoming instances to pre-generate for a recurring bill (no cron in this app). */
export function recurrenceLookahead(frequency: RecurrenceFrequency): number {
  return LOOKAHEAD_BY_FREQUENCY[frequency]
}

export function generateRecurrenceDates(
  firstDueDate: Date,
  frequency: RecurrenceFrequency,
  count: number = recurrenceLookahead(frequency)
): Date[] {
  const step = (date: Date) => {
    switch (frequency) {
      case "WEEKLY":
        return addWeeks(date, 1)
      case "MONTHLY":
        return addMonths(date, 1)
      case "YEARLY":
        return addYears(date, 1)
      case "CUSTOM":
      default:
        return date
    }
  }

  const dates: Date[] = [firstDueDate]
  for (let i = 1; i < count; i++) {
    dates.push(step(dates[i - 1]))
  }
  return dates
}

export type EffectiveBillStatus = "PAID" | "CANCELLED" | "OVERDUE" | "SCHEDULED" | "PENDING"

const SCHEDULED_THRESHOLD_DAYS = 7

/**
 * Bill.status only ever stores PENDING/PAID/CANCELLED (no background job
 * flips it). "Atrasada" and "Agendada" are derived here at read time from
 * a PENDING bill's dueDate relative to today.
 */
export function getEffectiveStatus(
  bill: { status: "PENDING" | "PAID" | "CANCELLED"; dueDate: Date },
  today: Date = new Date()
): EffectiveBillStatus {
  if (bill.status !== "PENDING") return bill.status

  const todayStart = startOfDay(today)
  const dueStart = startOfDay(bill.dueDate)
  const diffDays = Math.round((dueStart.getTime() - todayStart.getTime()) / 86_400_000)

  if (diffDays < 0) return "OVERDUE"
  if (diffDays > SCHEDULED_THRESHOLD_DAYS) return "SCHEDULED"
  return "PENDING"
}

export type SeriesEditScope = "this" | "future" | "all"

/**
 * Given every bill sharing a series (installment or recurring) and the one
 * the user is directly acting on, resolves which ids "this/future/all"
 * actually applies to. PAID/CANCELLED bills are excluded from "future"/"all"
 * unconditionally — a paid bill already produced a real Transaction (see
 * markBillAsPaid), so bulk-editing or deleting it out from under that would
 * corrupt reconciled history; a cancelled bill was a deliberate stop that
 * bulk scope shouldn't reverse. "this" has no such restriction since it
 * targets one row the user explicitly picked.
 */
export function resolveSeriesScope(
  seriesBills: { id: string; status: "PENDING" | "PAID" | "CANCELLED"; dueDate: Date }[],
  target: { id: string; dueDate: Date },
  scope: SeriesEditScope
): string[] {
  if (scope === "this") return [target.id]

  const eligible = seriesBills.filter((b) => b.status === "PENDING")

  if (scope === "future") {
    return eligible.filter((b) => b.dueDate >= target.dueDate).map((b) => b.id)
  }

  return eligible.map((b) => b.id)
}

/**
 * Shifts `billDueDate` to the same day-of-month as `newDueDate`, keeping
 * `billDueDate`'s own month/year — used when a series-wide due-date edit
 * ("todo dia 10 → todo dia 15") should preserve each occurrence's month
 * instead of collapsing every row onto one literal date. Clamps to the
 * target month's last day (e.g. day 31 in a 30-day month).
 */
export function shiftDueDateDay(billDueDate: Date, newDueDate: Date): Date {
  const day = Math.min(newDueDate.getDate(), getDaysInMonth(billDueDate))
  return setDate(billDueDate, day)
}

// Future extension point: generateBillInsights(bills) would plug into the
// existing lib/ai/* AIProvider abstraction (see src/lib/ai/provider.ts) the
// same way features/chat does — not implemented yet, structure only.
