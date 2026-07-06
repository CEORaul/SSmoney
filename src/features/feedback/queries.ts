import "server-only"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth/session"

export async function getFeedbackBannerDismissed(): Promise<boolean> {
  const profile = await requireUser()

  const settings = await prisma.userSettings.findUnique({
    where: { profileId: profile.id },
    select: { feedbackBannerDismissed: true },
  })

  return settings?.feedbackBannerDismissed ?? false
}

/** Admin-only — callers must check isAdmin() themselves before calling this. */
export async function listFeedbacks() {
  return prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    include: { profile: { select: { fullName: true, email: true } } },
  })
}
