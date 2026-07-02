import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export function RetrospectiveNav({
  year,
  hasNext,
}: {
  year: number
  hasNext: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="outline" size="icon">
        <Link href={`/retrospective/${year - 1}`} aria-label="Ano anterior">
          <ChevronLeft className="size-4" />
        </Link>
      </Button>
      <h2 className="min-w-24 text-center text-lg font-medium">{year}</h2>
      {hasNext ? (
        <Button asChild variant="outline" size="icon">
          <Link href={`/retrospective/${year + 1}`} aria-label="Próximo ano">
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="icon" disabled aria-label="Próximo ano">
          <ChevronRight className="size-4" />
        </Button>
      )}
    </div>
  )
}
