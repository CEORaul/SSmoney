import { TrendingDown, TrendingUp } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/money"
import type { CategoryDelta } from "@/features/month-end/queries"

function MoverCard({
  title,
  icon: Icon,
  tone,
  item,
  currency,
  emptyMessage,
}: {
  title: string
  icon: typeof TrendingUp
  tone: "up" | "down"
  item: CategoryDelta | null
  currency: string
  emptyMessage: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className={tone === "up" ? "size-4 text-negative" : "size-4 text-positive"} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {item ? (
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-medium">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color ?? "var(--muted-foreground)" }}
              />
              {item.name}
            </span>
            <span
              className={
                tone === "up"
                  ? "font-mono text-sm font-medium tabular-nums text-negative"
                  : "font-mono text-sm font-medium tabular-nums text-positive"
              }
            >
              {item.deltaCents > 0 ? "+" : "-"}
              {formatCurrency(Math.abs(item.deltaCents), currency)}
            </span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function TopMovers({
  topGainer,
  topShrink,
  currency,
}: {
  topGainer: CategoryDelta | null
  topShrink: CategoryDelta | null
  currency: string
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <MoverCard
        title="Categoria que mais cresceu"
        icon={TrendingUp}
        tone="up"
        item={topGainer}
        currency={currency}
        emptyMessage="Nenhuma categoria cresceu em relação ao mês anterior."
      />
      <MoverCard
        title="Categoria que mais diminuiu"
        icon={TrendingDown}
        tone="down"
        item={topShrink}
        currency={currency}
        emptyMessage="Nenhuma categoria diminuiu em relação ao mês anterior."
      />
    </div>
  )
}
