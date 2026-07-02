import { z } from "zod"

import { moneyAmountSchema } from "@/lib/validations/common"

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: moneyAmountSchema,
  categoryId: z.string().optional(),
  description: z.string().min(1, "Informe uma descrição"),
  date: z.coerce.date(),
  note: z.string().optional(),
  isPaid: z.boolean(),
  dueDate: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.date().optional()
  ),
})

export type TransactionInput = z.infer<typeof transactionSchema>

export const transactionFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  categoryId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
})

export type TransactionFiltersInput = z.infer<typeof transactionFiltersSchema>
