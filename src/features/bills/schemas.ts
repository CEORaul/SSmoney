import { z } from "zod"

import { moneyAmountSchema } from "@/lib/validations/common"

export const PAYMENT_METHODS = [
  "PIX",
  "CREDIT_CARD",
  "DEBIT_CARD",
  "BOLETO",
  "CASH",
  "BANK_TRANSFER",
  "OTHER",
] as const

export const BILL_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const

export const RECURRENCE_FREQUENCIES = ["WEEKLY", "MONTHLY", "YEARLY", "CUSTOM"] as const

export const billSchema = z.object({
  name: z.string().min(1, "Informe um nome"),
  description: z.string().optional(),
  note: z.string().optional(),
  amount: moneyAmountSchema,
  categoryId: z.string().optional(),
  dueDate: z.coerce.date(),
  priority: z.enum(BILL_PRIORITIES).default("MEDIUM"),
  tags: z.array(z.string().min(1)).default([]),
})

export type BillInput = z.infer<typeof billSchema>

export const installmentBillSchema = billSchema.omit({ amount: true, dueDate: true }).extend({
  totalAmount: moneyAmountSchema,
  installmentCount: z.coerce.number().int().min(2).max(60),
  firstDueDate: z.coerce.date(),
})

export type InstallmentBillInput = z.infer<typeof installmentBillSchema>

export const recurringBillSchema = billSchema.extend({
  recurrenceFrequency: z.enum(RECURRENCE_FREQUENCIES),
  recurrenceRule: z.string().optional(),
})

export type RecurringBillInput = z.infer<typeof recurringBillSchema>

export const markAsPaidSchema = z.object({
  paidAt: z.coerce.date(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
  paymentAccount: z.string().optional(),
  note: z.string().optional(),
})

export type MarkAsPaidInput = z.infer<typeof markAsPaidSchema>

export const billFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["PENDING", "PAID", "OVERDUE", "SCHEDULED", "CANCELLED"]).optional(),
  type: z.enum(["ONE_TIME", "INSTALLMENT", "RECURRING"]).optional(),
  categoryId: z.string().optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
  page: z.coerce.number().int().min(1).default(1),
})

export type BillFiltersInput = z.infer<typeof billFiltersSchema>

export const SERIES_EDIT_SCOPES = ["this", "future", "all"] as const

export const seriesEditScopeSchema = z.enum(SERIES_EDIT_SCOPES)

export type SeriesEditScopeInput = z.infer<typeof seriesEditScopeSchema>
