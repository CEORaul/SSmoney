"use client"

import { motion } from "motion/react"
import {
  LayoutDashboard,
  MessageCircle,
  Receipt,
  Target,
  ArrowLeftRight,
  BarChart3,
  type LucideIcon,
} from "lucide-react"

import { staggerContainer, fadeInUp } from "@/lib/motion"

const FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description:
      "Saldo, receitas, despesas e economia do mês, sempre atualizados num único painel — sem planilha, sem esforço.",
  },
  {
    icon: MessageCircle,
    title: "Assistente IA",
    description:
      "Converse com uma IA que já leu seus dados antes de responder. Perguntas diretas, respostas com contexto real.",
  },
  {
    icon: Receipt,
    title: "Contas a pagar",
    description:
      "Contas recorrentes e parceladas organizadas por mês, com status de pago, pendente e atrasado.",
  },
  {
    icon: Target,
    title: "Metas",
    description:
      "Defina objetivos financeiros e acompanhe o progresso real, mês a mês, sem depender de planilha manual.",
  },
  {
    icon: ArrowLeftRight,
    title: "Transações",
    description:
      "Registre receitas e despesas em segundos, organizadas por categoria automaticamente.",
  },
  {
    icon: BarChart3,
    title: "Análise mensal",
    description:
      "Um relatório automático do seu mês: comparação com o anterior, categorias que mais pesaram e insights prontos.",
  },
]

export function FeaturesSection() {
  return (
    <section id="recursos" className="py-24 md:py-32">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.h2
            variants={fadeInUp}
            className="font-heading text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Tudo que sua vida financeira precisa, num só lugar
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-lg text-muted-foreground">
            Cada parte do SSmoney foi pensada para reduzir o trabalho manual e
            te dar clareza real sobre para onde vai o seu dinheiro.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              className="group rounded-2xl border border-border/70 bg-card p-6 shadow-resting transition-all duration-300 hover:-translate-y-1 hover:shadow-raised"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="size-5" />
              </div>
              <h3 className="mt-5 font-heading text-lg font-semibold">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
