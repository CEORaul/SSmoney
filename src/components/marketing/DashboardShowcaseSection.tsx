"use client"

import { motion } from "motion/react"
import { Check } from "lucide-react"

import { DashboardMockup } from "@/components/marketing/DashboardMockup"
import { staggerContainer, fadeInUp } from "@/lib/motion"

const BENEFITS = [
  "Saldo, receitas, despesas e economia atualizados a cada movimentação",
  "Gráficos de evolução mensal e gastos por categoria, sem configurar nada",
  "Contas a pagar e patrimônio visíveis no mesmo painel, sem trocar de tela",
]

export function DashboardShowcaseSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-14 px-6 md:px-10 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
          <DashboardMockup />
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="order-1 lg:order-2"
        >
          <motion.h2
            variants={fadeInUp}
            className="font-heading text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Todos os seus números, organizados como deveriam estar.
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-5 text-lg text-muted-foreground">
            Chega de planilhas soltas e apps que só mostram números sem
            contexto. O Dashboard do SSmoney junta tudo num painel único — e
            se atualiza sozinho conforme você usa o app.
          </motion.p>

          <motion.ul variants={staggerContainer} className="mt-8 flex flex-col gap-4">
            {BENEFITS.map((benefit) => (
              <motion.li key={benefit} variants={fadeInUp} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="size-3.5" />
                </span>
                <span className="text-sm leading-relaxed text-foreground">{benefit}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  )
}
