import "server-only"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth/session"

export async function listGoals() {
  const profile = await requireUser()

  return prisma.goal.findMany({
    where: { profileId: profile.id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      contributions: { orderBy: { date: "desc" }, take: 3 },
    },
  })
}
