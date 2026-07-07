"use client"

import { motion } from "motion/react"
import {
  Sparkles,
  LayoutDashboard,
  Target,
  Receipt,
  BarChart3,
  ArrowLeftRight,
  History,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"

import { staggerContainer, fadeInUp } from "@/lib/motion"

const DIFFERENTIALS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Sparkles,
    title: "IA personalizada",
    description: "Respostas baseadas nos seus dados reais, não em médias genéricas.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard completo",
    description: "Toda a sua vida financeira visível num único painel.",
  },
  {
    icon: Target,
    title: "Metas",
    description: "Objetivos com progresso real, acompanhado mês a mês.",
  },
  {
    icon: Receipt,
    title: "Contas a pagar",
    description: "Recorrentes e parceladas, sempre organizadas por mês.",
  },
  {
    icon: BarChart3,
    title: "Análise mensal",
    description: "Comparação automática com o mês anterior, sem esforço.",
  },
  {
    icon: ArrowLeftRight,
    title: "Transações",
    description: "Receitas e despesas categorizadas em segundos.",
  },
  {
    icon: History,
    title: "Histórico",
    description: "Todas as suas movimentações, sempre acessíveis.",
  },
  {
    icon: ShieldCheck,
    title: "Segurança",
    description: "Autenticação robusta e dados protegidos de ponta a ponta.",
  },
]

export function DifferentialsSection() {
  return (
    <section className="bg-muted/30 py-24 md:py-32">
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
            Feito para quem leva finanças a sério
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        >
          {DIFFERENTIALS.map((item) => (
            <motion.div
              key={item.title}
              variants={fadeInUp}
              className="rounded-2xl border border-border/70 bg-card p-5 shadow-resting transition-all duration-300 hover:-translate-y-0.5 hover:shadow-raised"
            >
              <item.icon className="size-5 text-primary" />
              <h3 className="mt-3.5 text-sm font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
