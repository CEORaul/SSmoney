"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Send, Sparkles } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { toast } from "sonner"

import { sendMessage } from "@/features/chat/actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/generated/prisma/client"

type DisplayMessage = {
  id: string
  role: "USER" | "ASSISTANT" | "SYSTEM"
  content: string
  pending?: boolean
}

export function ChatWindow({
  conversationId,
  initialMessages,
}: {
  conversationId: string
  initialMessages: ChatMessage[]
}) {
  const [messages, setMessages] = useState<DisplayMessage[]>(
    initialMessages.map((m) => ({ id: m.id, role: m.role, content: m.content }))
  )
  const [input, setInput] = useState("")

  const mutation = useMutation({
    mutationFn: (content: string) => sendMessage(conversationId, { content }),
    onMutate: (content) => {
      const pendingId = `pending-${Date.now()}`
      setMessages((prev) => [
        ...prev,
        { id: `${pendingId}-user`, role: "USER", content },
        { id: pendingId, role: "ASSISTANT", content: "", pending: true },
      ])
      return { pendingId }
    },
    onSuccess: (result, _content, context) => {
      if (!context) return

      if ("error" in result) {
        toast.error(result.error)
        setMessages((prev) => prev.filter((m) => m.id !== context.pendingId))
        return
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === context.pendingId
            ? { id: result.reply.id, role: "ASSISTANT" as const, content: result.reply.content }
            : m
        )
      )
    },
    onError: (_error, _content, context) => {
      toast.error("Não foi possível enviar sua mensagem")
      if (context) {
        setMessages((prev) => prev.filter((m) => m.id !== context.pendingId))
      }
    },
  })

  function handleSend() {
    const content = input.trim()
    if (!content || mutation.isPending) return
    setInput("")
    mutation.mutate(content)
  }

  return (
    <div className="flex h-[calc(100vh-14rem)] flex-col rounded-lg border">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <Sparkles className="size-8" />
            <p className="text-sm">Pergunte sobre seus gastos, receitas ou metas.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className={cn("flex", message.role === "USER" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                    message.role === "USER"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  {message.pending ? (
                    <span className="flex items-center gap-1">
                      <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-current" />
                    </span>
                  ) : (
                    message.content
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
      <div className="flex items-end gap-2 border-t p-3">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Escreva sua pergunta..."
          rows={1}
          className="min-h-10 resize-none"
        />
        <Button size="icon" onClick={handleSend} disabled={mutation.isPending || !input.trim()}>
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  )
}
