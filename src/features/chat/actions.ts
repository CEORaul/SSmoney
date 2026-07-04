"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth/session"
import {
  reactToMessageSchema,
  renameConversationSchema,
  type ReactToMessageInput,
  type RenameConversationInput,
} from "@/features/chat/schemas"
import { listConversations } from "@/features/chat/queries"

type ActionResult = { error?: string } | { success: true }
// `error` must be required (not optional) here — an optional `error` on the
// same branch as an extra `id` property on the success branch defeats
// TypeScript's `"error" in result` narrowing (both branches would
// structurally allow `error` to be absent, so `.id` never narrows in).
type CreatedResult = { error: string } | { success: true; id: string }

function revalidateChat() {
  revalidatePath("/chat")
}

export async function createConversation(): Promise<CreatedResult> {
  const profile = await requireUser()

  const conversation = await prisma.chatConversation.create({
    data: { profileId: profile.id },
  })

  revalidateChat()
  return { success: true, id: conversation.id }
}

export async function renameConversation(
  id: string,
  input: RenameConversationInput
): Promise<ActionResult> {
  const parsed = renameConversationSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const profile = await requireUser()

  const result = await prisma.chatConversation.updateMany({
    where: { id, profileId: profile.id },
    data: { title: parsed.data.title },
  })
  if (result.count === 0) {
    return { error: "Conversa não encontrada" }
  }

  revalidateChat()
  return { success: true }
}

export async function togglePinConversation(id: string): Promise<ActionResult> {
  const profile = await requireUser()

  const conversation = await prisma.chatConversation.findFirst({
    where: { id, profileId: profile.id },
  })
  if (!conversation) {
    return { error: "Conversa não encontrada" }
  }

  await prisma.chatConversation.update({
    where: { id },
    data: { pinned: !conversation.pinned },
  })

  revalidateChat()
  return { success: true }
}

export async function duplicateConversation(id: string): Promise<CreatedResult> {
  const profile = await requireUser()

  const original = await prisma.chatConversation.findFirst({
    where: { id, profileId: profile.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  })
  if (!original) {
    return { error: "Conversa não encontrada" }
  }

  const copy = await prisma.chatConversation.create({
    data: {
      profileId: profile.id,
      title: original.title ? `${original.title} (cópia)` : null,
      messages: {
        create: original.messages.map((m) => ({
          role: m.role,
          content: m.content,
          provider: m.provider,
          feedback: m.feedback,
          metadata: m.metadata ?? undefined,
        })),
      },
    },
  })

  revalidateChat()
  return { success: true, id: copy.id }
}

export async function deleteConversation(id: string): Promise<ActionResult> {
  const profile = await requireUser()

  // ChatMessage.conversation has onDelete: Cascade — messages are removed
  // automatically at the DB level, no manual cleanup needed.
  const result = await prisma.chatConversation.deleteMany({
    where: { id, profileId: profile.id },
  })
  if (result.count === 0) {
    return { error: "Conversa não encontrada" }
  }

  revalidateChat()
  return { success: true }
}

export async function reactToMessage(
  messageId: string,
  input: ReactToMessageInput
): Promise<ActionResult> {
  const parsed = reactToMessageSchema.safeParse(input)
  if (!parsed.success) {
    return { error: "Dados inválidos" }
  }

  const profile = await requireUser()

  const message = await prisma.chatMessage.findFirst({
    where: { id: messageId, conversation: { profileId: profile.id } },
  })
  if (!message) {
    return { error: "Mensagem não encontrada" }
  }

  await prisma.chatMessage.update({
    where: { id: messageId },
    data: { feedback: parsed.data.feedback },
  })

  return { success: true }
}

/** Pure read, called directly from the client sidebar's "carregar mais". */
export async function loadMoreConversations(cursor?: string) {
  return listConversations(cursor)
}
