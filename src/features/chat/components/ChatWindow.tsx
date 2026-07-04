"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronUp, Send, Sparkles, Square } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageActions } from "@/features/chat/components/MessageActions"
import { ThinkingIndicator } from "@/features/chat/components/ThinkingIndicator"
import { SuggestionCards } from "@/features/chat/components/SuggestionCards"
import { staggerContainer, fadeInUp, scaleOnTap } from "@/lib/motion"
import { cn } from "@/lib/utils"
import type { ChatMessage, MessageFeedback } from "@/generated/prisma/client"

const MAX_MESSAGE_LENGTH = 2000
const CHAR_WARNING_THRESHOLD = 1800

type DisplayMessage = {
  id: string
  role: "USER" | "ASSISTANT" | "SYSTEM"
  content: string
  pending?: boolean
  feedback: MessageFeedback | null
}

type StreamEvent =
  | { type: "status"; phase: "context" }
  | { type: "delta"; text: string }
  | { type: "done"; id: string; truncated?: boolean }
  | { type: "error"; message: string }

const markdownComponents = {
  p: (props: React.ComponentProps<"p">) => <p className="mb-2 last:mb-0" {...props} />,
  ul: (props: React.ComponentProps<"ul">) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0" {...props} />,
  ol: (props: React.ComponentProps<"ol">) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0" {...props} />,
  li: (props: React.ComponentProps<"li">) => <li {...props} />,
  strong: (props: React.ComponentProps<"strong">) => <strong className="font-semibold" {...props} />,
  a: (props: React.ComponentProps<"a">) => (
    <a className="underline underline-offset-2" target="_blank" rel="noreferrer" {...props} />
  ),
  code: ({ className, ...props }: React.ComponentProps<"code">) => (
    <code
      className={cn("rounded bg-black/[0.06] px-1 py-0.5 font-mono text-[0.85em] dark:bg-white/10", className)}
      {...props}
    />
  ),
  pre: (props: React.ComponentProps<"pre">) => (
    <pre className="mb-2 overflow-x-auto rounded-md bg-black/[0.06] p-3 font-mono text-xs dark:bg-white/10 last:mb-0" {...props} />
  ),
  table: (props: React.ComponentProps<"table">) => (
    <div className="mb-2 overflow-x-auto last:mb-0">
      <table className="w-full border-collapse text-xs" {...props} />
    </div>
  ),
  th: (props: React.ComponentProps<"th">) => (
    <th className="border-b border-border/70 px-2 py-1 text-left font-medium" {...props} />
  ),
  td: (props: React.ComponentProps<"td">) => <td className="border-b border-border/40 px-2 py-1" {...props} />,
}

export function ChatWindow({
  conversationId,
  initialMessages,
  initialOldestCursor,
}: {
  conversationId: string
  initialMessages: ChatMessage[]
  initialOldestCursor: string | null
}) {
  const [messages, setMessages] = useState<DisplayMessage[]>(
    initialMessages.map((m) => ({ id: m.id, role: m.role, content: m.content, feedback: m.feedback }))
  )
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [thinkingPhase, setThinkingPhase] = useState<"context" | undefined>(undefined)
  const [oldestCursor, setOldestCursor] = useState(initialOldestCursor)
  const [isLoadingOlder, setIsLoadingOlder] = useState(false)
  const router = useRouter()
  const abortControllerRef = useRef<AbortController | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const shouldAutoScroll = useRef(true)

  useEffect(() => {
    if (shouldAutoScroll.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    shouldAutoScroll.current = true
  }, [messages])

  function updatePendingMessage(pendingId: string, update: (m: DisplayMessage) => DisplayMessage) {
    setMessages((prev) => prev.map((m) => (m.id === pendingId ? update(m) : m)))
  }

  async function runChatRequest(body: { content?: string; regenerateMessageId?: string }) {
    const pendingId = `pending-${Date.now()}`

    if (body.regenerateMessageId) {
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== body.regenerateMessageId),
        { id: pendingId, role: "ASSISTANT", content: "", pending: true, feedback: null },
      ])
    } else {
      setMessages((prev) => [
        ...prev,
        { id: `${pendingId}-user`, role: "USER", content: body.content!, feedback: null },
        { id: pendingId, role: "ASSISTANT", content: "", pending: true, feedback: null },
      ])
    }

    const controller = new AbortController()
    abortControllerRef.current = controller
    setIsStreaming(true)
    setThinkingPhase(undefined)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, ...body }),
        signal: controller.signal,
      })

      if (!response.ok || !response.body) {
        const errorBody = await response.json().catch(() => null)
        toast.error(errorBody?.error ?? "Não foi possível enviar sua mensagem")
        setMessages((prev) => prev.filter((m) => m.id !== pendingId && m.id !== `${pendingId}-user`))
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.trim()) continue
          const event = JSON.parse(line) as StreamEvent

          if (event.type === "status") {
            setThinkingPhase(event.phase)
          } else if (event.type === "delta") {
            updatePendingMessage(pendingId, (m) => ({ ...m, content: m.content + event.text, pending: false }))
          } else if (event.type === "done") {
            updatePendingMessage(pendingId, (m) => ({ ...m, id: event.id, pending: false }))
          } else if (event.type === "error") {
            toast.error(event.message)
          }
        }
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        updatePendingMessage(pendingId, (m) => ({
          ...m,
          pending: false,
          content: m.content || "_Geração cancelada._",
        }))
      } else {
        toast.error("Não foi possível enviar sua mensagem")
        setMessages((prev) => prev.filter((m) => m.id !== pendingId && m.id !== `${pendingId}-user`))
      }
    } finally {
      abortControllerRef.current = null
      setIsStreaming(false)
      setThinkingPhase(undefined)
      // Refreshes the server-rendered sidebar (message count, auto-title,
      // recency order) — /api/chat is a Route Handler, so unlike a Server
      // Action it never triggers this automatically.
      router.refresh()
    }
  }

  function handleSend(overrideContent?: string) {
    const content = (overrideContent ?? input).trim()
    if (!content || isStreaming) return
    if (!overrideContent) setInput("")
    runChatRequest({ content })
  }

  function handleCancel() {
    abortControllerRef.current?.abort()
  }

  function handleRegenerate(messageId: string) {
    if (isStreaming) return
    runChatRequest({ regenerateMessageId: messageId })
  }

  function handleFeedbackChange(messageId: string, feedback: MessageFeedback | null) {
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, feedback } : m)))
  }

  async function handleLoadOlder() {
    if (!oldestCursor || isLoadingOlder) return
    setIsLoadingOlder(true)
    try {
      const response = await fetch(
        `/api/chat/conversations/${conversationId}/messages?cursor=${encodeURIComponent(oldestCursor)}`
      )
      if (!response.ok) {
        toast.error("Não foi possível carregar mensagens anteriores")
        return
      }
      const data = (await response.json()) as {
        messages: ChatMessage[]
        nextCursor: string | null
      }
      shouldAutoScroll.current = false
      setMessages((prev) => [
        ...data.messages.map((m) => ({ id: m.id, role: m.role, content: m.content, feedback: m.feedback })),
        ...prev,
      ])
      setOldestCursor(data.nextCursor)
    } finally {
      setIsLoadingOlder(false)
    }
  }

  const lastMessage = messages[messages.length - 1]
  const lastAssistantMessageId =
    lastMessage && lastMessage.role === "ASSISTANT" && !lastMessage.pending ? lastMessage.id : null
  const isNearLimit = input.length >= CHAR_WARNING_THRESHOLD

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {oldestCursor && (
          <div className="flex justify-center pb-2">
            <Button variant="ghost" size="sm" onClick={handleLoadOlder} loading={isLoadingOlder} className="gap-1.5">
              <ChevronUp className="size-3.5" />
              Carregar mensagens anteriores
            </Button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Sparkles className="size-8" />
              <p className="text-sm">Pergunte sobre seus gastos, receitas, metas ou contas a pagar.</p>
            </div>
            <div className="w-full max-w-lg">
              <SuggestionCards onSelect={(text) => handleSend(text)} />
            </div>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="show">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  variants={fadeInUp}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "group/message flex flex-col",
                    message.role === "USER" ? "items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                      message.role === "USER" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    )}
                  >
                    {message.pending ? (
                      <ThinkingIndicator phase={thinkingPhase} />
                    ) : message.role === "ASSISTANT" ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      message.content
                    )}
                  </div>
                  {message.role === "ASSISTANT" && !message.pending && (
                    <MessageActions
                      messageId={message.id}
                      content={message.content}
                      feedback={message.feedback}
                      onFeedbackChange={(feedback) => handleFeedbackChange(message.id, feedback)}
                      onRegenerate={() => handleRegenerate(message.id)}
                      canRegenerate={message.id === lastAssistantMessageId}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-end gap-2 border-t p-3">
        <div className="relative flex-1">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Pergunte algo sobre suas finanças..."
            rows={1}
            maxLength={MAX_MESSAGE_LENGTH}
            className="max-h-40 min-h-10 resize-none overflow-y-auto pr-2"
          />
          {isNearLimit && (
            <span className="absolute right-2 bottom-1 text-xs tabular-nums text-muted-foreground">
              {input.length}/{MAX_MESSAGE_LENGTH}
            </span>
          )}
        </div>
        <motion.div whileTap={scaleOnTap}>
          {isStreaming ? (
            <Button size="icon" variant="outline" onClick={handleCancel} aria-label="Cancelar geração">
              <Square className="size-4" />
            </Button>
          ) : (
            <Button size="icon" onClick={() => handleSend()} disabled={!input.trim()}>
              <Send className="size-4" />
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  )
}
