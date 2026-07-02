"use client"

import { PieChart as PieChartIcon } from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/EmptyState"
import { formatCurrency } from "@/lib/money"

const FALLBACK_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

type BreakdownItem = {
  categoryId: string | null
  name: string
  color: string | null
  amountCents: number
}

export function CategoryBreakdownChart({
  data,
  currency,
}: {
  data: BreakdownItem[]
  currency: string
}) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Despesas por categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<PieChartIcon className="size-5" />}
            title="Sem despesas este mês"
            description="Registre transações para ver a distribuição por categoria."
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Despesas por categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="amountCents"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                animationDuration={700}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.categoryId ?? "uncategorized"}
                    fill={entry.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                    stroke="var(--card)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(Number(value), currency)}
                contentStyle={{
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border)",
                  background: "var(--popover)",
                  color: "var(--popover-foreground)",
                  boxShadow: "0 4px 16px oklch(0 0 0 / 0.12)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="mt-4 space-y-2">
          {data.map((entry, index) => (
            <li
              key={entry.categoryId ?? "uncategorized"}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <span className="flex items-center gap-2 text-muted-foreground">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      entry.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length],
                  }}
                />
                {entry.name}
              </span>
              <span className="font-medium text-foreground">
                {formatCurrency(entry.amountCents, currency)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
