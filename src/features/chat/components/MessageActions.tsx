"use client"

import { useState } from "react"
import { Check, Copy, RotateCcw, Share2, ThumbsDown, ThumbsUp } from "lucide-react"
import { toast } from "sonner"

import { reactToMessage } from "@/features/chat/actions"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { MessageFeedback } from "@/generated/prisma/client"

export function MessageActions({
  messageId,
  content,
  feedback,
  onFeedbackChange,
  onRegenerate,
  canRegenerate,
}: {
  messageId: string
  content: string
  feedback: MessageFeedback | null
  onFeedbackChange: (feedback: MessageFeedback | null) => void
  onRegenerate?: () => void
  canRegenerate: boolean
}) {
  const [copied, setCopied] = useState(false)

  async function onCopy() {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function onShare() {
    if (navigator.share) {
      try {
        await navigator.share({ text: content })
        return
      } catch {
        // user dismissed the native share sheet — fall back to copying below
      }
    }
    await navigator.clipboard.writeText(content)
    toast.success("Copiado para compartilhar")
  }

  function toggleFeedback(next: MessageFeedback) {
    const value = feedback === next ? null : next
    onFeedbackChange(value)
    reactToMessage(messageId, { feedback: value })
  }

  return (
    <div className="mt-1.5 flex items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover/message:opacity-100 has-[[data-state=open]]:opacity-100">
      <Button variant="ghost" size="icon-sm" onClick={onCopy} aria-label="Copiar">
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => toggleFeedback("LIKE")}
        aria-label="Curtir"
        className={cn(feedback === "LIKE" && "text-positive")}
      >
        <ThumbsUp className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => toggleFeedback("DISLIKE")}
        aria-label="Não gostei"
        className={cn(feedback === "DISLIKE" && "text-negative")}
      >
        <ThumbsDown className="size-3.5" />
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={onShare} aria-label="Compartilhar">
        <Share2 className="size-3.5" />
      </Button>
      {canRegenerate && onRegenerate && (
        <Button variant="ghost" size="icon-sm" onClick={onRegenerate} aria-label="Regenerar resposta">
          <RotateCcw className="size-3.5" />
        </Button>
      )}
    </div>
  )
}
