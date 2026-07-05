"use client"

import { motion } from "motion/react"

/**
 * Purely decorative, static recreation of the Dashboard's layout — no data
 * fetching, no shared components with the real /dashboard route. Numbers are
 * illustrative placeholders, not real statistics.
 */
function MiniBarChart() {
  const bars = [38, 52, 44, 61, 49, 70]
  return (
    <div className="flex h-24 items-end gap-2">
      {bars.map((h, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t-sm bg-primary/85"
            style={{ height: `${h}%` }}
          />
          <div
            className="w-full rounded-t-sm bg-[var(--negative)]/60"
            style={{ height: `${100 - h}%`, maxHeight: "30%" }}
          />
        </div>
      ))}
    </div>
  )
}

function MiniDonut() {
  return (
    <svg viewBox="0 0 36 36" className="size-20">
      <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--muted)" strokeWidth="4" />
      <circle
        cx="18"
        cy="18"
        r="15.5"
        fill="none"
        stroke="var(--chart-negative-1)"
        strokeWidth="4"
        strokeDasharray="62 100"
        strokeDashoffset="0"
        transform="rotate(-90 18 18)"
        strokeLinecap="round"
      />
      <circle
        cx="18"
        cy="18"
        r="15.5"
        fill="none"
        stroke="var(--chart-negative-3)"
        strokeWidth="4"
        strokeDasharray="24 100"
        strokeDashoffset="-62"
        transform="rotate(-90 18 18)"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotateX: 4 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1200 }}
      className="relative w-full max-w-xl"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 shadow-floating backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Resumo de julho</p>
            <p className="font-heading text-lg font-semibold">Olá, Ana</p>
          </div>
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            A
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 px-6 py-5 sm:grid-cols-4">
          {[
            { label: "Saldo", value: "R$ 4.280", tone: "text-foreground" },
            { label: "Receitas", value: "R$ 6.500", tone: "text-primary" },
            { label: "Despesas", value: "R$ 2.220", tone: "text-[var(--negative)]" },
            { label: "Economia", value: "34%", tone: "text-primary" },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border border-border/60 bg-background/60 p-3">
              <p className="text-[0.65rem] font-medium text-muted-foreground">{card.label}</p>
              <p className={`mt-1 text-sm font-semibold ${card.tone}`}>{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 px-6 pb-6 sm:grid-cols-[1.3fr_1fr]">
          <div className="rounded-xl border border-border/60 bg-background/60 p-4">
            <p className="mb-3 text-xs font-medium text-muted-foreground">Evolução mensal</p>
            <MiniBarChart />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/60 p-4">
            <MiniDonut />
            <p className="text-xs font-medium text-muted-foreground">Por categoria</p>
          </div>
        </div>
      </motion.div>

      {/* soft ambient glow behind the card */}
      <div
        aria-hidden
        className="absolute -inset-8 -z-10 rounded-[3rem] bg-primary/10 blur-3xl"
      />
    </motion.div>
  )
}
