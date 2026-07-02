"use client"

import { useState, useTransition } from "react"
import { Archive, ArchiveRestore, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import { motion } from "motion/react"
import { toast } from "sonner"

import {
  archiveGoal,
  deleteContribution,
  deleteGoal,
  unarchiveGoal,
} from "@/features/goals/actions"
import { GoalFormDialog } from "@/features/goals/components/GoalFormDialog"
import { ContributionDialog } from "@/features/goals/components/ContributionDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/money"
import { formatDate } from "@/lib/date"
import { cn } from "@/lib/utils"
import type { Goal, GoalContribution } from "@/generated/prisma/client"

type GoalWithContributions = Goal & { contributions: GoalContribution[] }

const STATUS_LABEL: Record<Goal["status"], string> = {
  ACTIVE: "Em andamento",
  COMPLETED: "Concluída",
  ARCHIVED: "Arquivada",
}

export function GoalCard({
  goal,
  index = 0,
}: {
  goal: GoalWithContributions
  index?: number
}) {
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [contributing, setContributing] = useState(false)

  const percent =
    goal.targetAmountCents > 0
      ? Math.min(100, Math.round((goal.currentAmountCents / goal.targetAmountCents) * 100))
      : 0

  function onArchive() {
    startTransition(async () => {
      const result = await archiveGoal(goal.id)
      if ("error" in result) {
        toast.error(result.error ?? "Não foi possível arquivar")
        return
      }
      toast.success("Meta arquivada")
    })
  }

  function onUnarchive() {
    startTransition(async () => {
      const result = await unarchiveGoal(goal.id)
      if ("error" in result) {
        toast.error(result.error ?? "Não foi possível restaurar")
        return
      }
      toast.success("Meta restaurada")
    })
  }

  function onDelete() {
    startTransition(async () => {
      const result = await deleteGoal(goal.id)
      if ("error" in result) {
        toast.error(result.error ?? "Não foi possível excluir")
        return
      }
      toast.success("Meta excluída")
    })
  }

  function onDeleteContribution(id: string) {
    startTransition(async () => {
      const result = await deleteContribution(id)
      if ("error" in result) {
        toast.error(result.error ?? "Não foi possível remover")
        return
      }
      toast.success("Contribuição removida")
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
    <Card className={cn(goal.status === "ARCHIVED" && "opacity-60")}>
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="text-lg">{goal.emoji || "🎯"}</span>
          {goal.name}
        </CardTitle>
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
            {goal.status === "ARCHIVED" ? (
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
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 className="mr-2 size-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <Badge variant={goal.status === "COMPLETED" ? "default" : "outline"}>
            {STATUS_LABEL[goal.status]}
          </Badge>
          {goal.targetDate && (
            <span className="text-muted-foreground">Até {formatDate(goal.targetDate)}</span>
          )}
        </div>

        <div className="space-y-2">
          <Progress value={percent} />
          <div className="flex items-end justify-between">
            <span className="text-xl font-semibold tracking-tight tabular-nums">
              {formatCurrency(goal.currentAmountCents)}
            </span>
            <span className="text-sm text-muted-foreground tabular-nums">
              de {formatCurrency(goal.targetAmountCents)} ({percent}%)
            </span>
          </div>
        </div>

        {goal.contributions.length > 0 && (
          <ul className="space-y-1 border-t pt-3">
            {goal.contributions.map((contribution) => (
              <li
                key={contribution.id}
                className="flex items-center justify-between text-xs text-muted-foreground"
              >
                <span>{formatDate(contribution.date)}</span>
                <span className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    +{formatCurrency(contribution.amountCents)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteContribution(contribution.id)}
                    disabled={isPending}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remover contribuição"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}

        {goal.status !== "ARCHIVED" && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setContributing(true)}
          >
            <Plus className="size-4" />
            Adicionar contribuição
          </Button>
        )}
      </CardContent>

      {editing && <GoalFormDialog goal={goal} open={editing} onOpenChange={setEditing} />}
      {contributing && (
        <ContributionDialog goalId={goal.id} open={contributing} onOpenChange={setContributing} />
      )}
    </Card>
    </motion.div>
  )
}
