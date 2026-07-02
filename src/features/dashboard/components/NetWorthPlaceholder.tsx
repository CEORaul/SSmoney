import { Wallet } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function NetWorthPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Patrimônio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
          <Wallet className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Em breve: acompanhe seus ativos e patrimônio líquido por aqui.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
