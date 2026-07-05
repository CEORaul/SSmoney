"use client"

import { motion } from "motion/react"

import { ChatMockup } from "@/components/marketing/ChatMockup"
import { staggerContainer, fadeInUp } from "@/lib/motion"

const EXAMPLE_PROMPTS = [
  "Como economizar R$500?",
  "Como foi meu fechamento do mês?",
  "Quanto posso investir?",
  "Onde estou gastando mais?",
]

export function AISection() {
  return (
    <section id="ia" className="bg-muted/30 py-24 md:py-32">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-14 px-6 md:px-10 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          <motion.h2
            variants={fadeInUp}
            className="font-heading text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Uma IA que realmente conhece suas finanças.
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-5 text-lg text-muted-foreground">
            Nada de respostas genéricas de chatbot. O assistente do SSmoney lê
            seus dados reais — receitas, despesas, metas e patrimônio — antes
            de te responder qualquer coisa.
          </motion.p>

          <motion.div variants={fadeInUp} className="mt-8 flex flex-wrap gap-2.5">
            {EXAMPLE_PROMPTS.map((prompt) => (
              <span
                key={prompt}
                className="rounded-full border border-border/70 bg-card px-4 py-2 text-sm text-foreground shadow-resting"
              >
                {prompt}
              </span>
            ))}
          </motion.div>
        </motion.div>

        <div className="flex justify-center lg:justify-end">
          <ChatMockup />
        </div>
      </div>
    </section>
  )
}
