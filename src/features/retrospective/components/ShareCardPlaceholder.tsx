import { Share2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ShareCardPlaceholder() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Share2 className="size-4" />
          Card para compartilhar
        </CardTitle>
        <Badge variant="outline">Em breve</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Em breve você vai poder gerar uma imagem com o resumo do seu ano para compartilhar.
        </p>
        <Button variant="outline" size="sm" disabled className="w-full">
          Gerar imagem
        </Button>
      </CardContent>
    </Card>
  )
}
