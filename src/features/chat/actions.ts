"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth/session"
import { getAIProvider } from "@/lib/ai/provider"
import { sendMessageSchema, type SendMessageInput } from "@/features/chat/schemas"
import type { ChatMessageInput } from "@/lib/ai/types"

type ActionResult =
  | { error: string }
  | { success: true; reply: { id: string; content: string } }

export async function sendMessage(
  conversationId: string,
  input: SendMessageInput
): Promise<ActionResult> {
  const parsed = sendMessageSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const profile = await requireUser()

  const conversation = await prisma.chatConversation.findFirst({
    where: { id: conversationId, profileId: profile.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  })
  if (!conversation) {
    return { error: "Conversa não encontrada" }
  }

  await prisma.chatMessage.create({
    data: { conversationId, role: "USER", content: parsed.data.content },
  })

  const history: ChatMessageInput[] = [
    ...conversation.messages.map((m) => ({
      role: m.role.toLowerCase() as ChatMessageInput["role"],
      content: m.content,
    })),
    { role: "user", content: parsed.data.content },
  ]

  const provider = getAIProvider()
  const result = await provider.chat({ messages: history })

  const assistantMessage = await prisma.chatMessage.create({
    data: {
      conversationId,
      role: "ASSISTANT",
      content: result.content,
      provider: result.providerLabel,
    },
  })

  await prisma.chatConversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  })

  revalidatePath("/chat")

  return {
    success: true,
    reply: { id: assistantMessage.id, content: assistantMessage.content },
  }
}
