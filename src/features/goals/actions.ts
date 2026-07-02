"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth/session"
import { amountToCents } from "@/lib/money"
import {
  contributionSchema,
  goalSchema,
  type ContributionInput,
  type GoalInput,
} from "@/features/goals/schemas"

type ActionResult = { error?: string } | { success: true }

export async function createGoal(input: GoalInput): Promise<ActionResult> {
  const parsed = goalSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const profile = await requireUser()

  await prisma.goal.create({
    data: {
      profileId: profile.id,
      name: parsed.data.name,
      emoji: parsed.data.emoji || undefined,
      targetAmountCents: amountToCents(parsed.data.targetAmount),
      targetDate: parsed.data.targetDate,
    },
  })

  revalidatePath("/goals")
  return { success: true }
}

export async function updateGoal(id: string, input: GoalInput): Promise<ActionResult> {
  const parsed = goalSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const profile = await requireUser()

  await prisma.goal.updateMany({
    where: { id, profileId: profile.id },
    data: {
      name: parsed.data.name,
      emoji: parsed.data.emoji || undefined,
      targetAmountCents: amountToCents(parsed.data.targetAmount),
      targetDate: parsed.data.targetDate,
    },
  })

  revalidatePath("/goals")
  return { success: true }
}

export async function archiveGoal(id: string): Promise<ActionResult> {
  const profile = await requireUser()

  await prisma.goal.updateMany({
    where: { id, profileId: profile.id },
    data: { status: "ARCHIVED" },
  })

  revalidatePath("/goals")
  return { success: true }
}

export async function unarchiveGoal(id: string): Promise<ActionResult> {
  const profile = await requireUser()

  await prisma.goal.updateMany({
    where: { id, profileId: profile.id },
    data: { status: "ACTIVE" },
  })

  revalidatePath("/goals")
  return { success: true }
}

export async function deleteGoal(id: string): Promise<ActionResult> {
  const profile = await requireUser()

  await prisma.goal.deleteMany({ where: { id, profileId: profile.id } })

  revalidatePath("/goals")
  return { success: true }
}

export async function addContribution(
  goalId: string,
  input: ContributionInput
): Promise<ActionResult> {
  const parsed = contributionSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const profile = await requireUser()

  const goal = await prisma.goal.findFirst({
    where: { id: goalId, profileId: profile.id },
  })
  if (!goal) {
    return { error: "Meta não encontrada" }
  }

  const amountCents = amountToCents(parsed.data.amount)
  const newCurrentCents = goal.currentAmountCents + amountCents

  await prisma.$transaction([
    prisma.goalContribution.create({
      data: {
        goalId,
        amountCents,
        date: parsed.data.date,
        note: parsed.data.note || undefined,
      },
    }),
    prisma.goal.update({
      where: { id: goalId },
      data: {
        currentAmountCents: newCurrentCents,
        status:
          goal.status === "ACTIVE" && newCurrentCents >= goal.targetAmountCents
            ? "COMPLETED"
            : goal.status,
      },
    }),
  ])

  revalidatePath("/goals")
  return { success: true }
}

export async function deleteContribution(id: string): Promise<ActionResult> {
  const profile = await requireUser()

  const contribution = await prisma.goalContribution.findFirst({
    where: { id, goal: { profileId: profile.id } },
    include: { goal: true },
  })
  if (!contribution) {
    return { error: "Contribuição não encontrada" }
  }

  const newCurrentCents = Math.max(
    0,
    contribution.goal.currentAmountCents - contribution.amountCents
  )

  await prisma.$transaction([
    prisma.goalContribution.delete({ where: { id } }),
    prisma.goal.update({
      where: { id: contribution.goalId },
      data: {
        currentAmountCents: newCurrentCents,
        status:
          contribution.goal.status === "COMPLETED" &&
          newCurrentCents < contribution.goal.targetAmountCents
            ? "ACTIVE"
            : contribution.goal.status,
      },
    }),
  ])

  revalidatePath("/goals")
  return { success: true }
}
