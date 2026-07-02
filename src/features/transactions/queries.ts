import "server-only"

import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth/session"
import type { TransactionFiltersInput } from "@/features/transactions/schemas"

const PAGE_SIZE = 20

export async function listTransactions(filters: TransactionFiltersInput) {
  const profile = await requireUser()

  const where: Prisma.TransactionWhereInput = {
    profileId: profile.id,
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.search
      ? {
          OR: [
            { description: { contains: filters.search, mode: "insensitive" } },
            { note: { contains: filters.search, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: "desc" },
      skip: (filters.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.transaction.count({ where }),
  ])

  return { items, total, pageSize: PAGE_SIZE, page: filters.page }
}

export async function getTransaction(id: string) {
  const profile = await requireUser()

  return prisma.transaction.findFirst({
    where: { id, profileId: profile.id },
  })
}
