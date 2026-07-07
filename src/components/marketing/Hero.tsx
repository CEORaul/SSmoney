"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DashboardMockup } from "@/components/marketing/DashboardMockup"
import { fadeInUp, staggerContainer } from "@/lib/motion"

export function Hero({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="relative overflow-hidden pt-36 pb-20 md:pt-44 md:pb-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem] bg-[radial-gradient(60%_60%_at_50%_0%,var(--primary)_0%,transparent_70%)] opacity-[0.07]"
      />

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-14 px-6 md:px-10 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col items-start"
        >
          <motion.div
            variants={fadeInUp}
            className="mb-6 flex items-center gap-2 rounded-full border border-border/70 bg-muted/60 px-3.5 py-1.5"
          >
            <Sparkles className="size-3.5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">
              Finanças pessoais com inteligência artificial
            </span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="font-heading text-4xl leading-[1.08] font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]"
          >
            Assuma o controle do seu dinheiro com uma IA que entende sua vida
            financeira.
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-6 max-w-xl text-lg text-muted-foreground"
          >
            SSmoney reúne receitas, contas e metas num só painel — e um
            assistente de IA que já conhece seus dados antes de responder, em
            vez de te devolver gráficos genéricos.
          </motion.p>

          <motion.div variants={fadeInUp} className="mt-9 flex flex-wrap gap-3">
            {isAuthenticated ? (
              <Button asChild size="lg" className="gap-2">
                <Link href="/dashboard">
                  Continuar para o app
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="gap-2">
                  <Link href="/signup">
                    Criar conta
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">Entrar</Link>
                </Button>
              </>
            )}
          </motion.div>
        </motion.div>

        <div className="flex justify-center lg:justify-end">
          <DashboardMockup />
        </div>
      </div>
    </section>
  )
}
