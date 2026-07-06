import { after } from "next/server"
import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma"
import { getSession, requireUser } from "@/lib/auth/session"
import { getAIProvider } from "@/lib/ai/provider"
import { buildFinancialContext } from "@/lib/ai/context"
import { classifyQuestion } from "@/lib/ai/classify"
import { deriveConversationTitle } from "@/features/chat/service"
import { chatRequestSchema } from "@/features/chat/schemas"
import type { ChatMessageInput } from "@/lib/ai/types"

// Detailed financial breakdowns can take ~20s+ to fully stream (measured
// against the live Gemini API) — without this, Vercel kills the function at
// its default timeout (10s on Hobby), cutting the response off mid-sentence
// with no error, which looked identical to the earlier max-tokens bug but
// had nothing to do with it.
export const maxDuration = 60

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

/** Best-effort, gated fresh at execution time so a fast regenerate can't race the message this reads. */
async function maybeGenerateTitle(conversationId: string) {
  try {
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 2 } },
    })
    if (!conversation || conversation.title !== null) return
    if (conversation.messages.length !== 2) return

    const firstUserMessage = conversation.messages.find((m) => m.role === "USER")
    if (!firstUserMessage) return

    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: { title: deriveConversationTitle(firstUserMessage.content) },
    })
  } catch {
    // Title generation is cosmetic — never let it surface to the user or block anything.
  }
}

export async function POST(request: Request) {
  // requireUser() would redirect() on missing auth, which is the right
  // behavior for a page render but throws an unhandled NEXT_REDIRECT here —
  // check the session directly first so an unauthenticated call gets a
  // clean 401 instead.
  const session = await getSession()
  if (!session) {
    return jsonError("Não autenticado", 401)
  }
  const profile = await requireUser()

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError("Corpo da requisição inválido", 400)
  }

  const parsed = chatRequestSchema.safeParse(body)
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Dados inválidos", 400)
  }

  const { conversationId, content, regenerateMessageId } = parsed.data

  const conversation = await prisma.chatConversation.findFirst({
    where: { id: conversationId, profileId: profile.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  })
  if (!conversation) {
    return jsonError("Conversa não encontrada", 404)
  }

  let priorMessages = conversation.messages
  let latestUserContent: string

  if (regenerateMessageId) {
    const lastMessage = priorMessages[priorMessages.length - 1]
    if (!lastMessage || lastMessage.id !== regenerateMessageId || lastMessage.role !== "ASSISTANT") {
      return jsonError("Só é possível regenerar a última resposta da conversa", 400)
    }

    await prisma.chatMessage.delete({ where: { id: regenerateMessageId } })
    priorMessages = priorMessages.slice(0, -1)

    const lastUserMessage = priorMessages[priorMessages.length - 1]
    if (!lastUserMessage || lastUserMessage.role !== "USER") {
      return jsonError("Não há pergunta para regenerar", 400)
    }
    latestUserContent = lastUserMessage.content
  } else {
    latestUserContent = content!
    await prisma.chatMessage.create({
      data: { conversationId, role: "USER", content: latestUserContent },
    })
  }

  const history: ChatMessageInput[] = [
    ...priorMessages.map((m) => ({
      role: m.role.toLowerCase() as ChatMessageInput["role"],
      content: m.content,
    })),
    ...(regenerateMessageId ? [] : [{ role: "user" as const, content: latestUserContent }]),
  ]

  const recentUserMessages = priorMessages
    .filter((m) => m.role === "USER")
    .slice(-3)
    .map((m) => m.content)
  const { needsUserData, topics } = classifyQuestion(latestUserContent, recentUserMessages)

  const provider = getAIProvider()
  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let accumulated = ""
      let finished = false

      function send(event: unknown) {
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`))
        } catch {
          // client already disconnected — persistence below still runs
        }
      }

      try {
        if (needsUserData) {
          send({ type: "status", phase: "context" })
        }
        const context = needsUserData ? await buildFinancialContext(topics) : undefined

        for await (const event of provider.chatStream({
          messages: history,
          context,
          signal: request.signal,
        })) {
          if (event.type === "delta") {
            accumulated += event.text
            send({ type: "delta", text: event.text })
          } else if (event.type === "done") {
            finished = true
            const assistantMessage = await prisma.chatMessage.create({
              data: {
                conversationId,
                role: "ASSISTANT",
                content: event.result.content,
                provider: event.result.providerLabel,
              },
            })
            send({ type: "done", id: assistantMessage.id })
          } else if (event.type === "error") {
            send({ type: "error", message: event.message })
          }
        }
      } finally {
        if (!finished && accumulated) {
          const assistantMessage = await prisma.chatMessage.create({
            data: {
              conversationId,
              role: "ASSISTANT",
              content: accumulated,
              provider: "anthropic:cancelled",
              metadata: { truncated: true },
            },
          })
          send({ type: "done", id: assistantMessage.id, truncated: true })
        }
        await prisma.chatConversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        })
        revalidatePath("/chat")
        after(() => maybeGenerateTitle(conversationId))
        try {
          controller.close()
        } catch {
          // already closed/errored — nothing left to do
        }
      }
    },
  })

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson" },
  })
}
