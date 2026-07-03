"use client"

import { Sparkles } from "lucide-react"
import { motion } from "motion/react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AIInsightTeaser() {
  return (
    <Card className="bg-gradient-to-br from-emerald-500/5 via-card to-card">
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <motion.span
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex"
          >
            <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400" />
          </motion.span>
          Insight da IA
        </CardTitle>
        <Badge variant="outline">Em breve</Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Em breve o assistente vai analisar seus hábitos automaticamente e trazer
          insights aqui, como &ldquo;você economizou 12% a mais este mês&rdquo;.
        </p>
      </CardContent>
    </Card>
  )
}
