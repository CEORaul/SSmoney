"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth/session"
import { amountToCents } from "@/lib/money"
import { assetSchema, type AssetInput } from "@/features/net-worth/schemas"

type ActionResult = { error?: string } | { success: true }

export async function createAsset(input: AssetInput): Promise<ActionResult> {
  const parsed = assetSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const profile = await requireUser()

  await prisma.asset.create({
    data: {
      profileId: profile.id,
      name: parsed.data.name,
      type: parsed.data.type,
      valueCents: amountToCents(parsed.data.value),
      asOfDate: parsed.data.asOfDate,
    },
  })

  revalidatePath("/net-worth")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function updateAsset(id: string, input: AssetInput): Promise<ActionResult> {
  const parsed = assetSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const profile = await requireUser()

  await prisma.asset.updateMany({
    where: { id, profileId: profile.id },
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      valueCents: amountToCents(parsed.data.value),
      asOfDate: parsed.data.asOfDate,
    },
  })

  revalidatePath("/net-worth")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteAsset(id: string): Promise<ActionResult> {
  const profile = await requireUser()

  await prisma.asset.deleteMany({ where: { id, profileId: profile.id } })

  revalidatePath("/net-worth")
  revalidatePath("/dashboard")
  return { success: true }
}
