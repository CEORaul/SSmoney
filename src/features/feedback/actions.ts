"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth/session"
import { feedbackSchema, type FeedbackInput } from "@/features/feedback/schemas"

type ActionResult = { error?: string } | { success: true }

export async function submitFeedback(input: FeedbackInput): Promise<ActionResult> {
  const parsed = feedbackSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const profile = await requireUser()

  await prisma.feedback.create({
    data: {
      profileId: profile.id,
      rating: parsed.data.rating,
      message: parsed.data.message,
      page: parsed.data.page,
    },
  })

  return { success: true }
}

export async function dismissFeedbackBanner(): Promise<ActionResult> {
  const profile = await requireUser()

  await prisma.userSettings.update({
    where: { profileId: profile.id },
    data: { feedbackBannerDismissed: true },
  })

  revalidatePath("/dashboard")
  return { success: true }
}
