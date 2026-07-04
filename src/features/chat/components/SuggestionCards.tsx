"use client"

import { motion } from "motion/react"
import { CreditCard, Landmark, LineChart, PiggyBank, TrendingUp, Wallet } from "lucide-react"

import { fadeInUp, staggerContainer } from "@/lib/motion"

const SUGGESTIONS = [
  { icon: PiggyBank, text: "Como economizar este mês?" },
  { icon: Wallet, text: "Como montar uma reserva de emergência?" },
  { icon: LineChart, text: "Analise minhas despesas" },
  { icon: TrendingUp, text: "Como investir melhor?" },
  { icon: Landmark, text: "Meu patrimônio está saudável?" },
  { icon: CreditCard, text: "Como sair das dívidas?" },
]

export function SuggestionCards({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-2 sm:grid-cols-2"
    >
      {SUGGESTIONS.map(({ icon: Icon, text }) => (
        <motion.button
          key={text}
          variants={fadeInUp}
          type="button"
          onClick={() => onSelect(text)}
          className="flex items-center gap-3 rounded-lg border border-border/70 p-3 text-left text-sm transition-colors hover:border-primary/40 hover:bg-accent/50"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </span>
          {text}
        </motion.button>
      ))}
    </motion.div>
  )
}
