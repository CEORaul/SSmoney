import { z } from "zod"

export const moneyAmountSchema = z
  .number({ error: "Informe um valor" })
  .positive("O valor deve ser maior que zero")

export const emailSchema = z.string().email("E-mail inválido")

export const passwordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres")
