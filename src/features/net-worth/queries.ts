import "server-only"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth/session"

export async function listAssets() {
  const profile = await requireUser()

  return prisma.asset.findMany({
    where: { profileId: profile.id },
    orderBy: [{ type: "asc" }, { valueCents: "desc" }],
  })
}

export async function getNetWorthSummary() {
  const profile = await requireUser()

  const grouped = await prisma.asset.groupBy({
    by: ["type"],
    where: { profileId: profile.id },
    _sum: { valueCents: true },
  })

  let totalCents = 0
  let hasAssets = false

  for (const g of grouped) {
    const sum = g._sum.valueCents ?? 0
    if (sum !== 0) hasAssets = true
    totalCents += g.type === "DEBT" ? -sum : sum
  }

  return { totalCents, hasAssets, currency: profile.currency }
}
