import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function MonthNav({
  monthLabel,
  previousYearMonth,
  nextYearMonth,
  isClosed,
}: {
  monthLabel: string
  previousYearMonth: string
  nextYearMonth: string | null
  isClosed: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="outline" size="icon">
        <Link href={`/month-end/${previousYearMonth}`} aria-label="Mês anterior">
          <ChevronLeft className="size-4" />
        </Link>
      </Button>
      <div className="flex min-w-40 items-center justify-center gap-2">
        <h2 className="text-lg font-medium">{monthLabel}</h2>
        <Badge variant={isClosed ? "outline" : "default"}>
          {isClosed ? "Fechado" : "Em andamento"}
        </Badge>
      </div>
      {nextYearMonth ? (
        <Button asChild variant="outline" size="icon">
          <Link href={`/month-end/${nextYearMonth}`} aria-label="Próximo mês">
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="icon" disabled aria-label="Próximo mês">
          <ChevronRight className="size-4" />
        </Button>
      )}
    </div>
  )
}
