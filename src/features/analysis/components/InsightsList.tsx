import { Lightbulb } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/EmptyState"
import { cn } from "@/lib/utils"
import type { Insight } from "@/features/analysis/queries"

const DOT_TONE_CLASS = {
  positive: "bg-positive",
  negative: "bg-negative",
  neutral: "bg-muted-foreground",
} as const

export function InsightsList({ insights }: { insights: Insight[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="size-4" />
          Insights automáticos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <EmptyState
            icon={<Lightbulb className="size-5" />}
            title="Sem insights ainda"
            description="Registre mais movimentações para receber análises automáticas deste mês."
          />
        ) : (
          <ul className="space-y-3">
            {insights.map((insight) => (
              <li key={insight.text} className="flex items-start gap-3 text-sm">
                <span
                  className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", DOT_TONE_CLASS[insight.tone])}
                />
                {insight.text}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
