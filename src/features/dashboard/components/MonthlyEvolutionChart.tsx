"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { centsToAmount, formatCurrency } from "@/lib/money"

type EvolutionPoint = {
  yearMonth: string
  label: string
  incomeCents: number
  expenseCents: number
}

export function MonthlyEvolutionChart({
  data,
  currency,
}: {
  data: EvolutionPoint[]
  currency: string
}) {
  const chartData = data.map((point) => ({
    label: point.label,
    Receitas: centsToAmount(point.incomeCents),
    Despesas: centsToAmount(point.expenseCents),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={40}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                tickFormatter={(value: number) =>
                  new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(value)
                }
              />
              <Tooltip
                formatter={(value) => formatCurrency(Math.round(Number(value) * 100), currency)}
                contentStyle={{
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border)",
                  background: "var(--popover)",
                  color: "var(--popover-foreground)",
                }}
              />
              <Bar dataKey="Receitas" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Despesas" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
