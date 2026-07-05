"use client"

import { motion } from "motion/react"
import { UserPlus, ListPlus, Sparkles } from "lucide-react"

import { staggerContainer, fadeInUp } from "@/lib/motion"

const STEPS = [
  {
    icon: UserPlus,
    title: "Crie sua conta",
    description: "Leva menos de um minuto. Sem cartão de crédito, sem burocracia.",
  },
  {
    icon: ListPlus,
    title: "Adicione suas movimentações",
    description:
      "Registre receitas e despesas por categoria — o SSmoney organiza tudo automaticamente.",
  },
  {
    icon: Sparkles,
    title: "Receba análises inteligentes",
    description:
      "A IA lê seus dados e te avisa o que importa: para onde vai seu dinheiro e como melhorar.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-24 md:py-32">
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
            Como funciona
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-lg text-muted-foreground">
            Do cadastro à primeira análise, sem fricção.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="relative mt-16 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8"
        >
          <div
            aria-hidden
            className="absolute top-6 right-[16.5%] left-[16.5%] hidden h-px bg-border md:block"
          />

          {STEPS.map((step, index) => (
            <motion.div
              key={step.title}
              variants={fadeInUp}
              className="relative flex flex-col items-center text-center md:items-start md:text-left"
            >
              <div className="relative z-10 flex size-12 items-center justify-center rounded-full border border-border bg-card shadow-resting">
                <step.icon className="size-5 text-primary" />
              </div>
              <span className="mt-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Etapa {index + 1}
              </span>
              <h3 className="mt-1.5 font-heading text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
