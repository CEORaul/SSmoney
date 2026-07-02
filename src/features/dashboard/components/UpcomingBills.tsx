import { CalendarClock } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/EmptyState"
import { formatCurrency } from "@/lib/money"
import { formatDate } from "@/lib/date"
import type { Category, Transaction } from "@/generated/prisma/client"

type BillWithCategory = Transaction & { category: Category | null }

export function UpcomingBills({ bills }: { bills: BillWithCategory[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos vencimentos</CardTitle>
      </CardHeader>
      <CardContent>
        {bills.length === 0 ? (
          <EmptyState
            icon={<CalendarClock className="size-5" />}
            title="Nada por vir"
            description="Contas com vencimento pendente aparecerão aqui."
          />
        ) : (
          <ul className="space-y-3">
            {bills.map((bill) => (
              <li key={bill.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <CalendarClock className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{bill.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {bill.category?.name ?? "Sem categoria"} ·{" "}
                      {bill.dueDate ? formatDate(bill.dueDate) : "Sem data"}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-medium">
                  {formatCurrency(bill.amountCents, bill.currency)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
