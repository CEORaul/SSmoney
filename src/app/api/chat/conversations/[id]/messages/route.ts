import type { NextRequest } from "next/server"

import { prisma } from "@/lib/prisma"
import { getSession, requireUser } from "@/lib/auth/session"
import { getConversationMessages } from "@/features/chat/queries"

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

/** Lazy-loads older messages within a conversation — scroll-up pagination, cancelable via fetch's AbortController. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) {
    return jsonError("Não autenticado", 401)
  }
  const profile = await requireUser()

  const { id: conversationId } = await params

  const conversation = await prisma.chatConversation.findFirst({
    where: { id: conversationId, profileId: profile.id },
  })
  if (!conversation) {
    return jsonError("Conversa não encontrada", 404)
  }

  const cursor = request.nextUrl.searchParams.get("cursor") ?? undefined
  const { messages, nextCursor } = await getConversationMessages(conversationId, cursor)

  return Response.json({ messages, nextCursor })
}
