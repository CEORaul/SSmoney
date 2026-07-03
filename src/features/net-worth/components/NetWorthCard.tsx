import Link from "next/link"
import { Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedNumber } from "@/components/shared/AnimatedNumber"
import { cn } from "@/lib/utils"

export function NetWorthCard({
  totalCents,
  hasAssets,
  currency,
}: {
  totalCents: number
  hasAssets: boolean
  currency: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Patrimônio</CardTitle>
      </CardHeader>
      <CardContent>
        {hasAssets ? (
          <div className="space-y-3">
            <AnimatedNumber
              cents={totalCents}
              currency={currency}
              className={cn(
                "block text-3xl font-semibold",
                totalCents < 0 && "text-red-600 dark:text-red-400"
              )}
            />
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/net-worth">Ver ativos</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-4 text-center">
            <Wallet className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Adicione seus ativos para acompanhar seu patrimônio líquido.
            </p>
            <Button asChild size="sm">
              <Link href="/net-worth">Adicionar ativo</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
