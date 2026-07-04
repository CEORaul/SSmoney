import { Repeat } from "lucide-react"

import type { BillWithDetails } from "@/features/bills/queries"
import {
  BILL_PRIORITY_LABELS,
  BILL_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  RECURRENCE_FREQUENCY_LABELS,
} from "@/features/bills/bill-options"
import { BillStatusBadge } from "@/features/bills/components/BillStatusBadge"
import { CategoryIcon } from "@/features/categories/components/CategoryIcon"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { formatCurrency } from "@/lib/money"
import { formatDate } from "@/lib/date"

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-3 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}

export function BillDetailSheet({
  bill,
  open,
  onOpenChange,
}: {
  bill: BillWithDetails
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <CategoryIcon name={bill.category?.icon} className="size-4" />
            </span>
            {bill.name}
          </SheetTitle>
          <SheetDescription>{bill.description || "Detalhes da conta"}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <BillStatusBadge status={bill.effectiveStatus} />
            <Badge variant="outline">{BILL_TYPE_LABELS[bill.type]}</Badge>
            <Badge variant="outline">{BILL_PRIORITY_LABELS[bill.priority]}</Badge>
          </div>

          <div>
            <Row
              label="Valor"
              value={
                <span className="font-mono tabular-nums">
                  {formatCurrency(bill.amountCents, bill.currency)}
                </span>
              }
            />
            <Row label="Categoria" value={bill.category?.name ?? "Sem categoria"} />
            <Row label="Vencimento" value={formatDate(bill.dueDate)} />
            {bill.paidAt && <Row label="Pago em" value={formatDate(bill.paidAt)} />}
            {bill.paymentMethod && (
              <Row label="Forma de pagamento" value={PAYMENT_METHOD_LABELS[bill.paymentMethod]} />
            )}
            {bill.paymentAccount && <Row label="Conta utilizada" value={bill.paymentAccount} />}
            {bill.installmentTotal && (
              <Row
                label="Parcela"
                value={`${bill.installmentNumber} de ${bill.installmentTotal}`}
              />
            )}
            {bill.recurrenceFrequency && (
              <Row
                label="Recorrência"
                value={
                  <span className="inline-flex items-center gap-1">
                    <Repeat className="size-3.5" />
                    {RECURRENCE_FREQUENCY_LABELS[bill.recurrenceFrequency]}
                  </span>
                }
              />
            )}
          </div>

          {bill.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {bill.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {bill.note && (
            <div className="rounded-lg border border-border/70 bg-muted/30 p-3 text-sm text-muted-foreground">
              {bill.note}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
