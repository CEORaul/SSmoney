import { z } from "zod"

import { moneyAmountSchema } from "@/lib/validations/common"

export const goalSchema = z.object({
  name: z.string().min(1, "Informe um nome"),
  emoji: z.string().optional(),
  targetAmount: moneyAmountSchema,
  targetDate: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.date().optional()
  ),
})

export type GoalInput = z.infer<typeof goalSchema>

export const contributionSchema = z.object({
  amount: moneyAmountSchema,
  date: z.coerce.date(),
  note: z.string().optional(),
})

export type ContributionInput = z.infer<typeof contributionSchema>
