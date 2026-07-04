"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { SERIES_EDIT_SCOPES, type SeriesEditScopeInput } from "@/features/bills/schemas"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { BillType } from "@/generated/prisma/client"

type SeriesActionResult = { error?: string } | { success: true; affectedCount: number }

const SCOPE_LABELS: Record<"INSTALLMENT" | "RECURRING", Record<SeriesEditScopeInput, string>> = {
  INSTALLMENT: {
    this: "Apenas esta parcela",
    future: "Esta parcela e todas as próximas",
    all: "Todas as parcelas",
  },
  RECURRING: {
    this: "Apenas esta ocorrência",
    future: "Esta ocorrência e todas as próximas",
    all: "Todas as recorrências",
  },
}

/**
 * Google-Calendar-style "apply to which occurrences" prompt, reused for
 * editing, cancelling, and deleting installment/recurring bills. Purely UI —
 * the caller supplies `onConfirm`, which performs the actual series Server
 * Action (updateBillSeries/cancelBillSeries/deleteBillSeries) and returns the
 * affected count, since PAID/CANCELLED bills are silently skipped for
 * "future"/"all" scope and the user should see how many rows really changed.
 */
export function SeriesEditScopeDialog({
  open,
  onOpenChange,
  billType,
  successVerb,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  billType: Extract<BillType, "INSTALLMENT" | "RECURRING">
  successVerb: string
  onConfirm: (scope: SeriesEditScopeInput) => Promise<SeriesActionResult>
}) {
  const [scope, setScope] = useState<SeriesEditScopeInput>("this")
  const [isPending, startTransition] = useTransition()
  const labels = SCOPE_LABELS[billType]

  function handleConfirm() {
    startTransition(async () => {
      const result = await onConfirm(scope)
      if ("error" in result && result.error) {
        toast.error(result.error)
        return
      }
      if ("affectedCount" in result) {
        const count = result.affectedCount
        toast.success(`${count} conta${count === 1 ? "" : "s"} ${successVerb}${count === 1 ? "" : "s"}`)
      }
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Como deseja aplicar esta alteração?</DialogTitle>
          <DialogDescription>
            Esta conta faz parte de uma série — escolha o escopo antes de confirmar.
          </DialogDescription>
        </DialogHeader>
        <RadioGroup value={scope} onValueChange={(value) => setScope(value as SeriesEditScopeInput)}>
          {SERIES_EDIT_SCOPES.map((s) => (
            <label
              key={s}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/70 p-3 text-sm has-data-checked:border-primary has-data-checked:bg-primary/[0.04]"
            >
              <RadioGroupItem value={s} />
              {labels[s]}
            </label>
          ))}
        </RadioGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} loading={isPending}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
