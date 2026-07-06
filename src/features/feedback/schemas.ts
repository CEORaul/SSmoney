import { z } from "zod"

export const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  message: z.string().min(1, "Escreva uma mensagem").max(500, "Mensagem muito longa"),
  page: z.string().min(1),
})

export type FeedbackInput = z.infer<typeof feedbackSchema>
