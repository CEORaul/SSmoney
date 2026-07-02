"use client"

import { useState, useTransition } from "react"
import { Archive, ArchiveRestore, MoreHorizontal, Pencil, Tag, Trash2 } from "lucide-react"
import { motion } from "motion/react"
import { toast } from "sonner"

import {
  archiveCategory,
  deleteCategory,
  unarchiveCategory,
} from "@/features/categories/actions"
import { CategoryFormDialog } from "@/features/categories/components/CategoryFormDialog"
import { CategoryIcon } from "@/features/categories/components/CategoryIcon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/shared/EmptyState"
import { cn } from "@/lib/utils"
import { fadeInUp, staggerContainer } from "@/lib/motion"
import type { Category } from "@/generated/prisma/client"

export function CategoryGroup({
  title,
  categories,
}: {
  title: string
  categories: Category[]
}) {
  const active = categories.filter((c) => !c.isArchived)
  const archived = categories.filter((c) => c.isArchived)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {active.length === 0 ? (
          <EmptyState
            icon={<Tag className="size-5" />}
            title="Nenhuma categoria"
            description="Crie uma categoria para começar a organizar suas transações."
          />
        ) : (
          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-1"
          >
            {active.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))}
          </motion.ul>
        )}
        {archived.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Arquivadas</p>
            <ul className="space-y-1">
              {archived.map((category) => (
                <CategoryRow key={category.id} category={category} archived />
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CategoryRow({
  category,
  archived,
}: {
  category: Category
  archived?: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)

  function onArchive() {
    startTransition(async () => {
      const result = await archiveCategory(category.id)
      if ("error" in result) {
        toast.error(result.error ?? "Não foi possível arquivar")
        return
      }
      toast.success("Categoria arquivada")
    })
  }

  function onUnarchive() {
    startTransition(async () => {
      const result = await unarchiveCategory(category.id)
      if ("error" in result) {
        toast.error(result.error ?? "Não foi possível restaurar")
        return
      }
      toast.success("Categoria restaurada")
    })
  }

  function onDelete() {
    startTransition(async () => {
      const result = await deleteCategory(category.id)
      if ("error" in result) {
        toast.error(result.error ?? "Não foi possível excluir")
        return
      }
      toast.success("Categoria excluída")
    })
  }

  return (
    <motion.li
      variants={archived ? undefined : fadeInUp}
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/40",
        archived && "opacity-60"
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full"
          style={{
            backgroundColor: category.color ? `${category.color}26` : "var(--muted)",
            color: category.color ?? undefined,
          }}
        >
          <CategoryIcon name={category.icon} className="size-4" />
        </span>
        <div>
          <p className="text-sm font-medium">{category.name}</p>
          {category.isDefault && (
            <Badge variant="outline" className="mt-0.5">
              Padrão
            </Badge>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isPending}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditing(true)}>
            <Pencil className="mr-2 size-4" />
            Editar
          </DropdownMenuItem>
          {archived ? (
            <DropdownMenuItem onClick={onUnarchive}>
              <ArchiveRestore className="mr-2 size-4" />
              Restaurar
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={onArchive}>
              <Archive className="mr-2 size-4" />
              Arquivar
            </DropdownMenuItem>
          )}
          {!category.isDefault && (
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 className="mr-2 size-4" />
              Excluir
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {editing && (
        <CategoryFormDialog category={category} open={editing} onOpenChange={setEditing} />
      )}
    </motion.li>
  )
}
