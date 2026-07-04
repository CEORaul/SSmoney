import "server-only"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth/session"

const CONVERSATIONS_PAGE_SIZE = 20
export const MESSAGES_PAGE_SIZE = 30

/**
 * Page-bootstrap only — returns the most-recently-updated conversation or
 * creates one. Used exclusively by the redirect in `src/app/(app)/chat/page.tsx`.
 * Do NOT call this from a client-driven conversation switch — those always
 * navigate to an explicit `/chat/[conversationId]`, which uses
 * `getConversation` below so the user's actual selection is respected.
 */
export async function getOrCreateConversation() {
  const profile = await requireUser()

  const existing = await prisma.chatConversation.findFirst({
    where: { profileId: profile.id },
    orderBy: { updatedAt: "desc" },
  })

  if (existing) {
    return existing
  }

  return prisma.chatConversation.create({
    data: { profileId: profile.id },
  })
}

export type ConversationSummary = {
  id: string
  title: string | null
  pinned: boolean
  updatedAt: Date
  messageCount: number
}

function toSummary(c: {
  id: string
  title: string | null
  pinned: boolean
  updatedAt: Date
  _count: { messages: number }
}): ConversationSummary {
  return {
    id: c.id,
    title: c.title,
    pinned: c.pinned,
    updatedAt: c.updatedAt,
    messageCount: c._count.messages,
  }
}

/**
 * Cursor-paginated by pinned-then-recency — grouping into
 * Hoje/Ontem/Esta semana/Últimos 30 dias happens client-side (same pattern
 * BillList.tsx already uses for date-bucketing).
 */
export async function listConversations(cursor?: string, limit: number = CONVERSATIONS_PAGE_SIZE) {
  const profile = await requireUser()

  const rows = await prisma.chatConversation.findMany({
    where: { profileId: profile.id },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: { _count: { select: { messages: true } } },
  })

  const hasMore = rows.length > limit
  const page = hasMore ? rows.slice(0, limit) : rows

  return {
    items: page.map(toSummary),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  }
}

/**
 * Raw paginated message fetch — NO ownership check inside. Callers (the
 * `/chat/[conversationId]` page and the messages pagination Route Handler)
 * each already verify the conversation belongs to the current user as their
 * own first step, so this stays a reusable building block instead of a
 * second, redundant auth check.
 */
export async function getConversationMessages(
  conversationId: string,
  cursor?: string,
  limit: number = MESSAGES_PAGE_SIZE
) {
  const rows = await prisma.chatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  })

  const hasMore = rows.length > limit
  const page = hasMore ? rows.slice(0, limit) : rows
  page.reverse() // ascending (oldest-first) for display

  return {
    messages: page,
    nextCursor: hasMore ? rows[limit].id : null,
  }
}

/** Ownership-checked fetch of a conversation + its most recent page of messages. */
export async function getConversation(id: string) {
  const profile = await requireUser()

  const conversation = await prisma.chatConversation.findFirst({
    where: { id, profileId: profile.id },
  })
  if (!conversation) return null

  const { messages, nextCursor } = await getConversationMessages(id)

  return { conversation, messages, nextCursor }
}
