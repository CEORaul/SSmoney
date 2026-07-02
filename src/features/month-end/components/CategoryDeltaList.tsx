import { PieChart } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/EmptyState"
import { formatCurrency } from "@/lib/money"
import { cn } from "@/lib/utils"
import type { CategoryDelta } from "@/features/month-end/queries"

export function CategoryDeltaList({
  items,
  currency,
}: {
  items: CategoryDelta[]
  currency: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Despesas por categoria</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={<PieChart className="size-5" />}
            title="Sem despesas"
            description="Nenhuma despesa registrada neste mês ou no anterior."
          />
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.categoryId ?? "uncategorized"}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color ?? "var(--muted-foreground)" }}
                  />
                  {item.name}
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-medium text-foreground">
                    {formatCurrency(item.currentCents, currency)}
                  </span>
                  <span
                    className={cn(
                      "w-20 text-right text-xs",
                      item.deltaCents > 0
                        ? "text-red-600 dark:text-red-400"
                        : item.deltaCents < 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground"
                    )}
                  >
                    {item.deltaCents === 0
                      ? "—"
                      : `${item.deltaCents > 0 ? "+" : "-"}${formatCurrency(Math.abs(item.deltaCents), currency)}`}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
