"use client"

import { useState, useTransition, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"

import { submitFeedback } from "@/features/feedback/actions"
import { StarRating } from "@/features/feedback/components/StarRating"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

const MAX_MESSAGE_LENGTH = 500

export function FeedbackDialog({ trigger }: { trigger: ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState<number | undefined>(undefined)
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      // Reset after the close animation finishes so the form doesn't visibly reset mid-close.
      setTimeout(() => {
        setRating(undefined)
        setMessage("")
        setSubmitted(false)
      }, 200)
    }
  }

  function onSubmit() {
    startTransition(async () => {
      const result = await submitFeedback({ rating, message, page: pathname })
      if ("error" in result) {
        toast.error(result.error ?? "Não foi possível enviar seu feedback")
        return
      }
      setSubmitted(true)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        {submitted ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <p className="text-2xl">❤️ Obrigado!</p>
            <p className="text-sm text-muted-foreground">
              Seu feedback foi enviado e será analisado. Ele nos ajuda a construir um
              SSmoney cada vez melhor.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Enviar feedback</DialogTitle>
              <DialogDescription>
                Leva menos de 30 segundos — sua opinião nos ajuda a melhorar.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Como foi sua experiência?</p>
                <StarRating value={rating} onChange={setRating} />
              </div>

              <div className="space-y-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                  placeholder="Conte rapidamente o que podemos melhorar ou o que você gostou."
                  rows={4}
                  maxLength={MAX_MESSAGE_LENGTH}
                />
                <p className="text-right text-xs text-muted-foreground">
                  {message.length}/{MAX_MESSAGE_LENGTH}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={onSubmit} loading={isPending} disabled={!message.trim()}>
                Enviar feedback
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
