import { z } from "zod"

import { passwordSchema } from "@/lib/validations/common"

export const profileSchema = z.object({
  fullName: z.string().min(2, "Informe seu nome completo"),
  currency: z.string().min(3).max(3),
})

export const changePasswordSchema = z.object({
  password: passwordSchema,
})

export type ProfileInput = z.infer<typeof profileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
