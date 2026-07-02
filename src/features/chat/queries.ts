import "server-only"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth/session"

export async function getOrCreateConversation() {
  const profile = await requireUser()

  const existing = await prisma.chatConversation.findFirst({
    where: { profileId: profile.id },
    orderBy: { updatedAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  })

  if (existing) {
    return existing
  }

  return prisma.chatConversation.create({
    data: { profileId: profile.id },
    include: { messages: true },
  })
}
