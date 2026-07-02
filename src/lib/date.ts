import {
  endOfMonth,
  format,
  parse,
  startOfMonth,
  subMonths,
} from "date-fns"
import { ptBR } from "date-fns/locale"

/** "2026-07" style key used by MonthlySnapshot.yearMonth */
export function toYearMonth(date: Date): string {
  return format(date, "yyyy-MM")
}

export function fromYearMonth(yearMonth: string): Date {
  return parse(yearMonth, "yyyy-MM", new Date())
}

export function monthRange(yearMonth: string): { start: Date; end: Date } {
  const date = fromYearMonth(yearMonth)
  return { start: startOfMonth(date), end: endOfMonth(date) }
}

export function previousYearMonth(yearMonth: string): string {
  return toYearMonth(subMonths(fromYearMonth(yearMonth), 1))
}

export function formatMonthLabel(yearMonth: string): string {
  return format(fromYearMonth(yearMonth), "MMMM yyyy", { locale: ptBR })
}

export function formatDate(date: Date, pattern = "dd/MM/yyyy"): string {
  return format(date, pattern, { locale: ptBR })
}
