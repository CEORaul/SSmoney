import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { EFFECTIVE_STATUS_LABELS } from "@/features/bills/bill-options"
import type { EffectiveBillStatus } from "@/features/bills/service"

const STATUS_CLASS: Record<EffectiveBillStatus, string> = {
  PAID: "bg-positive/10 text-positive",
  OVERDUE: "bg-negative/10 text-negative",
  CANCELLED: "text-muted-foreground",
  SCHEDULED: "text-muted-foreground",
  PENDING: "text-foreground",
}

export function BillStatusBadge({
  status,
  className,
}: {
  status: EffectiveBillStatus
  className?: string
}) {
  return (
    <Badge variant="outline" className={cn(STATUS_CLASS[status], className)}>
      {EFFECTIVE_STATUS_LABELS[status]}
    </Badge>
  )
}
