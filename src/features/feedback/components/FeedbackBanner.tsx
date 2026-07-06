"use client"

import { useState, useTransition } from "react"
import { X } from "lucide-react"

import { dismissFeedbackBanner } from "@/features/feedback/actions"
import { FeedbackDialog } from "@/features/feedback/components/FeedbackDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function FeedbackBanner({ initialDismissed }: { initialDismissed: boolean }) {
  const [dismissed, setDismissed] = useState(initialDismissed)
  const [, startTransition] = useTransition()

  function onDismiss() {
    setDismissed(true)
    startTransition(() => {
      dismissFeedbackBanner()
    })
  }

  if (dismissed) return null

  return (
    <Card className="relative border-primary/20 bg-primary/[0.04]">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onDismiss}
        aria-label="Fechar"
        className="absolute top-3 right-3"
      >
        <X className="size-4" />
      </Button>
      <CardContent className="flex flex-col gap-3 pr-10 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div>
          <p className="font-medium">🚀 Você faz parte dos primeiros usuários do SSmoney.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Estamos evoluindo a plataforma constantemente. Sua opinião faz toda a
            diferença para construirmos um produto cada vez melhor.
          </p>
        </div>
        <FeedbackDialog trigger={<Button className="shrink-0">Enviar feedback</Button>} />
      </CardContent>
    </Card>
  )
}
