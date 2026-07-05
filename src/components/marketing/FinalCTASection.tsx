"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { fadeInUp } from "@/lib/motion"

export function FinalCTASection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="px-6 py-20 md:px-10 md:py-28">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeInUp}
        className="relative mx-auto flex w-full max-w-6xl flex-col items-center overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center shadow-floating md:py-20"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_50%_0%,rgba(255,255,255,0.14)_0%,transparent_70%)]"
        />

        <h2 className="relative font-heading text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
          Comece a organizar sua vida financeira hoje.
        </h2>
        <p className="relative mt-4 max-w-xl text-lg text-primary-foreground/80">
          Sem planilhas, sem complicação — só clareza sobre para onde vai o
          seu dinheiro e uma IA pronta para ajudar.
        </p>

        <div className="relative mt-9">
          {isAuthenticated ? (
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link href="/dashboard">
                Continuar para o app
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link href="/signup">
                Criar conta gratuitamente
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}
        </div>
      </motion.div>
    </section>
  )
}
