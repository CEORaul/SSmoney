import "server-only"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth/session"
import type { CategoryType } from "@/generated/prisma/client"

export async function listCategories(type?: CategoryType) {
  const profile = await requireUser()

  return prisma.category.findMany({
    where: {
      profileId: profile.id,
      isArchived: false,
      ...(type ? { type } : {}),
    },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  })
}

export async function listAllCategories() {
  const profile = await requireUser()

  return prisma.category.findMany({
    where: { profileId: profile.id },
    orderBy: [{ isArchived: "asc" }, { isDefault: "desc" }, { name: "asc" }],
  })
}
