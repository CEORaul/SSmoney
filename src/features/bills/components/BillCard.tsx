"use client"

import { useState, useTransition } from "react"
import {
  CheckCircle2,
  Copy,
  Eye,
  MoreHorizontal,
  Pencil,
  Repeat,
  Trash2,
  XCircle,
} from "lucide-react"
import { motion } from "motion/react"
import { toast } from "sonner"

import {
  cancelBill,
  cancelBillSeries,
  deleteBill,
  deleteBillSeries,
  duplicateBill,
} from "@/features/bills/actions"
import type { BillWithDetails } from "@/features/bills/queries"
import {
  PAYMENT_METHOD_ICONS,
  PAYMENT_METHOD_LABELS,
  RECURRENCE_FREQUENCY_LABELS,
} from "@/features/bills/bill-options"
import { BillStatusBadge } from "@/features/bills/components/BillStatusBadge"
import { BillFormDialog } from "@/features/bills/components/BillFormDialog"
import { MarkAsPaidDialog } from "@/features/bills/components/MarkAsPaidDialog"
import { BillDetailSheet } from "@/features/bills/components/BillDetailSheet"
import { SeriesEditScopeDialog } from "@/features/bills/components/SeriesEditScopeDialog"
import { CategoryIcon } from "@/features/categories/components/CategoryIcon"
import { AnimatedNumber } from "@/components/shared/AnimatedNumber"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { fadeInUp } from "@/lib/motion"
import { formatDate } from "@/lib/date"
import type { Category } from "@/generated/prisma/client"

export function BillCard({
  bill,
  categories,
}: {
  bill: BillWithDetails
  categories: Category[]
}) {
  const [isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const [isMarkingPaid, setIsMarkingPaid] = useState(false)
  const [isViewingDetails, setIsViewingDetails] = useState(false)
  const [seriesAction, setSeriesAction] = useState<"cancel" | "delete" | null>(null)

  const isPaid = bill.effectiveStatus === "PAID"
  const isCancelled = bill.effectiveStatus === "CANCELLED"
  const canMarkPaid = !isPaid && !isCancelled
  const isSeries = bill.type === "INSTALLMENT" || bill.type === "RECURRING"
  const PaymentIcon = bill.paymentMethod ? PAYMENT_METHOD_ICONS[bill.paymentMethod] : null

  function onDuplicate() {
    startTransition(async () => {
      const result = await duplicateBill(bill.id)
      if ("error" in result) {
        toast.error(result.error ?? "Não foi possível duplicar")
        return
      }
      toast.success("Conta duplicada")
    })
  }

  function onCancel() {
    if (isSeries) {
      setSeriesAction("cancel")
      return
    }
    startTransition(async () => {
      const result = await cancelBill(bill.id)
      if ("error" in result) {
        toast.error(result.error ?? "Não foi possível cancelar")
        return
      }
      toast.success("Conta cancelada")
    })
  }

  function onDelete() {
    if (isSeries) {
      setSeriesAction("delete")
      return
    }
    startTransition(async () => {
      const result = await deleteBill(bill.id)
      if ("error" in result) {
        toast.error(result.error ?? "Não foi possível excluir")
        return
      }
      toast.success("Conta excluída")
    })
  }

  return (
    <motion.div variants={fadeInUp}>
      <Card size="sm">
        <CardContent className="flex items-center gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CategoryIcon name={bill.category?.icon} className="size-4" />
          </span>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-medium">{bill.name}</p>
              <BillStatusBadge status={bill.effectiveStatus} />
              {bill.installmentTotal && (
                <Badge variant="outline" className="text-muted-foreground">
                  {bill.installmentNumber}/{bill.installmentTotal}
                </Badge>
              )}
              {bill.recurrenceFrequency && (
                <Badge variant="outline" className="gap-1 text-muted-foreground">
                  <Repeat className="size-3" />
                  {RECURRENCE_FREQUENCY_LABELS[bill.recurrenceFrequency]}
                </Badge>
              )}
              {isPaid && PaymentIcon && (
                <Badge variant="outline" className="gap-1 text-muted-foreground">
                  <PaymentIcon className="size-3" />
                  {bill.paymentMethod ? PAYMENT_METHOD_LABELS[bill.paymentMethod] : null}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {bill.category?.name ?? "Sem categoria"} · Vencimento {formatDate(bill.dueDate)}
            </p>
          </div>

          <AnimatedNumber cents={bill.amountCents} className="shrink-0 text-base font-semibold" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isPending}>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canMarkPaid && (
                <DropdownMenuItem onSelect={() => setIsMarkingPaid(true)}>
                  <CheckCircle2 className="mr-2 size-4" />
                  Marcar como pago
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={() => setIsViewingDetails(true)}>
                <Eye className="mr-2 size-4" />
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setIsEditing(true)}>
                <Pencil className="mr-2 size-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="mr-2 size-4" />
                Duplicar
              </DropdownMenuItem>
              {!isPaid && !isCancelled && (
                <DropdownMenuItem onClick={onCancel}>
                  <XCircle className="mr-2 size-4" />
                  Cancelar
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                <Trash2 className="mr-2 size-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      {isEditing && (
        <BillFormDialog
          categories={categories}
          bill={bill}
          open={isEditing}
          onOpenChange={setIsEditing}
        />
      )}
      {isMarkingPaid && (
        <MarkAsPaidDialog bill={bill} open={isMarkingPaid} onOpenChange={setIsMarkingPaid} />
      )}
      {isViewingDetails && (
        <BillDetailSheet bill={bill} open={isViewingDetails} onOpenChange={setIsViewingDetails} />
      )}
      {seriesAction && (bill.type === "INSTALLMENT" || bill.type === "RECURRING") && (
        <SeriesEditScopeDialog
          open
          onOpenChange={(next) => !next && setSeriesAction(null)}
          billType={bill.type}
          successVerb={seriesAction === "cancel" ? "cancelada" : "excluída"}
          onConfirm={(scope) =>
            seriesAction === "cancel"
              ? cancelBillSeries(bill.id, scope)
              : deleteBillSeries(bill.id, scope)
          }
        />
      )}
    </motion.div>
  )
}
