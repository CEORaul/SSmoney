import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

/**
 * Mirrors features/month-end/components/MonthNav.tsx — plain server-renderable
 * prev/next Links around a centered label. Unlike month-end (retrospective
 * only), Bills allows navigating into future months freely, so `nextYearMonth`
 * is never disabled. Month-to-month animation comes for free from
 * PageTransition.tsx (keyed on the pathname, which changes with the route).
 */
export function BillsMonthNav({
  monthLabel,
  previousYearMonth,
  nextYearMonth,
}: {
  monthLabel: string
  previousYearMonth: string
  nextYearMonth: string
}) {
  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="outline" size="icon">
        <Link href={`/bills/${previousYearMonth}`} aria-label="Mês anterior">
          <ChevronLeft className="size-4" />
        </Link>
      </Button>
      <h2 className="min-w-40 text-center text-lg font-medium capitalize">{monthLabel}</h2>
      <Button asChild variant="outline" size="icon">
        <Link href={`/bills/${nextYearMonth}`} aria-label="Próximo mês">
          <ChevronRight className="size-4" />
        </Link>
      </Button>
    </div>
  )
}
