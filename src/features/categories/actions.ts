"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth/session"
import { categorySchema, type CategoryInput } from "@/features/categories/schemas"

type ActionResult = { error?: string } | { success: true }

export async function createCategory(input: CategoryInput): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const profile = await requireUser()

  await prisma.category.create({
    data: { ...parsed.data, profileId: profile.id },
  })

  revalidatePath("/categories")
  revalidatePath("/transactions")
  return { success: true }
}

export async function updateCategory(
  id: string,
  input: CategoryInput
): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const profile = await requireUser()

  await prisma.category.updateMany({
    where: { id, profileId: profile.id },
    data: parsed.data,
  })

  revalidatePath("/categories")
  revalidatePath("/transactions")
  return { success: true }
}

export async function archiveCategory(id: string): Promise<ActionResult> {
  const profile = await requireUser()

  await prisma.category.updateMany({
    where: { id, profileId: profile.id },
    data: { isArchived: true },
  })

  revalidatePath("/categories")
  revalidatePath("/transactions")
  return { success: true }
}

export async function unarchiveCategory(id: string): Promise<ActionResult> {
  const profile = await requireUser()

  await prisma.category.updateMany({
    where: { id, profileId: profile.id },
    data: { isArchived: false },
  })

  revalidatePath("/categories")
  revalidatePath("/transactions")
  return { success: true }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const profile = await requireUser()

  const category = await prisma.category.findFirst({
    where: { id, profileId: profile.id },
  })

  if (!category) {
    return { error: "Categoria não encontrada" }
  }

  if (category.isDefault) {
    return { error: "Categorias padrão não podem ser excluídas, apenas arquivadas" }
  }

  await prisma.category.delete({ where: { id } })

  revalidatePath("/categories")
  revalidatePath("/transactions")
  return { success: true }
}
