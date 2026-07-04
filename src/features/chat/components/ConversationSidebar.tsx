"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Copy, MoreHorizontal, Pencil, Pin, PinOff, Plus, Share2, Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
  createConversation,
  deleteConversation,
  duplicateConversation,
  loadMoreConversations,
  renameConversation,
  togglePinConversation,
} from "@/features/chat/actions"
import type { ConversationSummary } from "@/features/chat/queries"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type GroupKey = "Fixadas" | "Hoje" | "Ontem" | "Esta semana" | "Últimos 30 dias" | "Mais antigas"

const GROUP_ORDER: GroupKey[] = ["Fixadas", "Hoje", "Ontem", "Esta semana", "Últimos 30 dias", "Mais antigas"]

function groupKeyFor(c: ConversationSummary, today: Date): GroupKey {
  if (c.pinned) return "Fixadas"
  const diffDays = Math.floor((today.getTime() - new Date(c.updatedAt).getTime()) / 86_400_000)
  if (diffDays < 1) return "Hoje"
  if (diffDays < 2) return "Ontem"
  if (diffDays < 7) return "Esta semana"
  if (diffDays < 30) return "Últimos 30 dias"
  return "Mais antigas"
}

export function ConversationSidebar({
  activeConversationId,
  initialConversations,
  initialCursor,
  onNavigate,
}: {
  activeConversationId: string
  initialConversations: ConversationSummary[]
  initialCursor: string | null
  onNavigate?: () => void
}) {
  const router = useRouter()
  const [conversations, setConversations] = useState(initialConversations)
  const [cursor, setCursor] = useState(initialCursor)
  const [isPending, startTransition] = useTransition()
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")

  // `initialConversations` only changes when the parent Server Component
  // re-renders (e.g. after ChatWindow calls router.refresh() post-message) —
  // sync it in so title/count/order updates reach this client-held list.
  useEffect(() => {
    setConversations(initialConversations)
  }, [initialConversations])

  function onNewConversation() {
    startTransition(async () => {
      const result = await createConversation()
      if ("error" in result) {
        toast.error(result.error ?? "Não foi possível criar conversa")
        return
      }
      onNavigate?.()
      router.push(`/chat/${result.id}`)
    })
  }

  function onLoadMore() {
    if (!cursor) return
    startTransition(async () => {
      const result = await loadMoreConversations(cursor)
      setConversations((prev) => [...prev, ...result.items])
      setCursor(result.nextCursor)
    })
  }

  function onTogglePin(id: string) {
    startTransition(async () => {
      const result = await togglePinConversation(id)
      if ("error" in result) {
        toast.error(result.error ?? "Não foi possível fixar")
        return
      }
      setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)))
    })
  }

  function onDuplicate(id: string) {
    startTransition(async () => {
      const result = await duplicateConversation(id)
      if ("error" in result) {
        toast.error(result.error ?? "Não foi possível duplicar")
        return
      }
      toast.success("Conversa duplicada")
      onNavigate?.()
      router.push(`/chat/${result.id}`)
    })
  }

  function onDelete(id: string) {
    startTransition(async () => {
      const result = await deleteConversation(id)
      if ("error" in result) {
        toast.error(result.error ?? "Não foi possível excluir")
        return
      }
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (id === activeConversationId) {
        onNavigate?.()
        router.push("/chat")
      }
    })
  }

  async function onShare(id: string, title: string | null) {
    const url = `${window.location.origin}/chat/${id}`
    if (navigator.share) {
      try {
        await navigator.share({ title: title ?? "Conversa SSmoney", url })
        return
      } catch {
        // user dismissed the native share sheet — fall back to copying below
      }
    }
    await navigator.clipboard.writeText(url)
    toast.success("Link copiado")
  }

  function openRename(id: string, currentTitle: string | null) {
    setRenamingId(id)
    setRenameValue(currentTitle ?? "")
  }

  function confirmRename() {
    if (!renamingId || !renameValue.trim()) return
    const id = renamingId
    const title = renameValue.trim()
    startTransition(async () => {
      const result = await renameConversation(id, { title })
      if ("error" in result) {
        toast.error(result.error ?? "Não foi possível renomear")
        return
      }
      setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)))
      setRenamingId(null)
    })
  }

  const today = new Date()
  const groups = new Map<GroupKey, ConversationSummary[]>()
  for (const c of conversations) {
    const key = groupKeyFor(c, today)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(c)
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="p-3">
        <Button className="w-full justify-start gap-2" onClick={onNewConversation} disabled={isPending}>
          <Plus className="size-4" />
          Nova conversa
        </Button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-2 pb-3">
        {conversations.length === 0 ? (
          <p className="px-2 text-sm text-muted-foreground">Nenhuma conversa ainda.</p>
        ) : (
          GROUP_ORDER.filter((key) => groups.has(key)).map((key) => (
            <div key={key} className="space-y-1">
              <h3 className="px-2 text-xs font-medium text-muted-foreground">{key}</h3>
              {groups.get(key)!.map((c) => (
                <div key={c.id} className="group/item relative">
                  <Link
                    href={`/chat/${c.id}`}
                    onClick={onNavigate}
                    className={cn(
                      "flex flex-col gap-0.5 rounded-lg px-2 py-2 text-sm transition-colors",
                      c.id === activeConversationId ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
                    )}
                  >
                    <span className="truncate pr-6 font-medium">{c.title ?? "Nova conversa"}</span>
                    <span className="text-xs text-muted-foreground">
                      {c.messageCount} {c.messageCount === 1 ? "mensagem" : "mensagens"}
                    </span>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="absolute top-1.5 right-1.5 opacity-0 focus-visible:opacity-100 group-hover/item:opacity-100 data-[state=open]:opacity-100"
                      >
                        <MoreHorizontal className="size-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => openRename(c.id, c.title)}>
                        <Pencil className="mr-2 size-4" />
                        Editar nome
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTogglePin(c.id)}>
                        {c.pinned ? <PinOff className="mr-2 size-4" /> : <Pin className="mr-2 size-4" />}
                        {c.pinned ? "Desafixar" : "Fixar"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicate(c.id)}>
                        <Copy className="mr-2 size-4" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onShare(c.id, c.title)}>
                        <Share2 className="mr-2 size-4" />
                        Compartilhar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => onDelete(c.id)}>
                        <Trash2 className="mr-2 size-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          ))
        )}
        {cursor && (
          <Button variant="ghost" size="sm" className="w-full" onClick={onLoadMore} disabled={isPending}>
            Carregar mais
          </Button>
        )}
      </div>

      <Dialog open={renamingId !== null} onOpenChange={(open) => !open && setRenamingId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar nome da conversa</DialogTitle>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && confirmRename()}
            autoFocus
          />
          <DialogFooter>
            <Button onClick={confirmRename} loading={isPending} disabled={!renameValue.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
