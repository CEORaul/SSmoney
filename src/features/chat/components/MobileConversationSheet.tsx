"use client"

import { useState } from "react"
import { History } from "lucide-react"

import { ConversationSidebar } from "@/features/chat/components/ConversationSidebar"
import type { ConversationSummary } from "@/features/chat/queries"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function MobileConversationSheet({
  activeConversationId,
  initialConversations,
  initialCursor,
}: {
  activeConversationId: string
  initialConversations: ConversationSummary[]
  initialCursor: string | null
}) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <History className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="h-14 justify-center border-b px-4">
          <SheetTitle>Conversas</SheetTitle>
        </SheetHeader>
        <ConversationSidebar
          activeConversationId={activeConversationId}
          initialConversations={initialConversations}
          initialCursor={initialCursor}
          onNavigate={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  )
}
