"use client"

import { motion } from "motion/react"
import { Sparkles } from "lucide-react"

import { staggerContainer, fadeInUp } from "@/lib/motion"

const EXCHANGE = [
  { role: "user" as const, text: "Como economizar R$500 esse mês?" },
  {
    role: "assistant" as const,
    text: "Vi que você gastou 22% a mais em Alimentação este mês. Cortando pedidos de delivery pela metade, você já chega perto dos R$500 — quer que eu ajuste sua meta?",
  },
  { role: "user" as const, text: "Onde estou gastando mais?" },
]

export function ChatMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-lg"
    >
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 shadow-floating backdrop-blur-xl">
        <div className="flex items-center gap-2 border-b border-border/60 px-5 py-4">
          <Sparkles className="size-4 text-primary" />
          <p className="text-sm font-semibold">Assistente IA</p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-col gap-3 px-5 py-6"
        >
          {EXCHANGE.map((message, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {message.text}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div
        aria-hidden
        className="absolute -inset-8 -z-10 rounded-[3rem] bg-primary/10 blur-3xl"
      />
    </motion.div>
  )
}
