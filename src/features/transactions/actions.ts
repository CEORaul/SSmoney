"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth/session"
import { amountToCents } from "@/lib/money"
import {
  transactionSchema,
  type TransactionInput,
} from "@/features/transactions/schemas"

type ActionResult = { error?: string } | { success: true }

function toData(input: TransactionInput) {
  return {
    type: input.type,
    amountCents: amountToCents(input.amount),
    categoryId: input.categoryId || null,
    description: input.description,
    date: input.date,
    note: input.note || null,
    isPaid: input.isPaid,
    dueDate: input.dueDate ?? null,
  }
}

export async function createTransaction(
  input: TransactionInput
): Promise<ActionResult> {
  const parsed = transactionSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const profile = await requireUser()

  await prisma.transaction.create({
    data: { ...toData(parsed.data), profileId: profile.id },
  })

  revalidatePath("/transactions")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function updateTransaction(
  id: string,
  input: TransactionInput
): Promise<ActionResult> {
  const parsed = transactionSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const profile = await requireUser()

  await prisma.transaction.updateMany({
    where: { id, profileId: profile.id },
    data: toData(parsed.data),
  })

  revalidatePath("/transactions")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  const profile = await requireUser()

  await prisma.transaction.deleteMany({
    where: { id, profileId: profile.id },
  })

  revalidatePath("/transactions")
  revalidatePath("/dashboard")
  return { success: true }
}
