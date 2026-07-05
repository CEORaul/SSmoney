"use client"

import { motion } from "motion/react"
import { Plus } from "lucide-react"

import { staggerContainer, fadeInUp } from "@/lib/motion"

const FAQ_ITEMS = [
  {
    question: "Preciso conectar minha conta bancária?",
    answer:
      "Não. Você registra suas movimentações diretamente no SSmoney, sem precisar compartilhar credenciais bancárias com terceiros.",
  },
  {
    question: "A IA tem acesso aos meus dados financeiros?",
    answer:
      "Sim — é assim que ela responde com contexto real em vez de respostas genéricas. Seus dados continuam privados e vinculados apenas à sua conta.",
  },
  {
    question: "Preciso pagar para começar?",
    answer:
      "Não. Você pode criar sua conta gratuitamente e começar a organizar suas finanças agora mesmo.",
  },
  {
    question: "Preciso entender de investimentos para usar?",
    answer:
      "Não. O assistente explica conceitos e contextualiza suas perguntas, mesmo que você esteja começando do zero.",
  },
  {
    question: "Funciona bem no celular?",
    answer:
      "Sim. O SSmoney foi criado para oferecer a mesma experiência tanto no desktop quanto no celular.",
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="py-24 md:py-32">
      <div className="mx-auto w-full max-w-3xl px-6 md:px-10">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="text-center"
        >
          <motion.h2
            variants={fadeInUp}
            className="font-heading text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Perguntas frequentes
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="mt-12 flex flex-col gap-3"
        >
          {FAQ_ITEMS.map((item) => (
            <motion.details
              key={item.question}
              variants={fadeInUp}
              className="group rounded-xl border border-border/70 bg-card px-5 py-4 shadow-resting"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground">
                {item.question}
                <Plus className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </p>
            </motion.details>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
