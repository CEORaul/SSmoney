import { z } from "zod"

export const categorySchema = z.object({
  name: z.string().min(1, "Informe um nome"),
  type: z.enum(["INCOME", "EXPENSE"]),
  icon: z.string().optional(),
  color: z.string().optional(),
})

export type CategoryInput = z.infer<typeof categorySchema>
