"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"

const DEFAULT_PHRASES = ["Pensando...", "Gerando resposta..."]
const CONTEXT_PHRASES = ["Analisando seus dados...", "Consultando suas finanças...", "Gerando resposta..."]

/** Elegant "thinking" state — cycling phrases + pulsing dots, never a plain spinner. */
export function ThinkingIndicator({ phase }: { phase?: "context" }) {
  const phrases = phase === "context" ? CONTEXT_PHRASES : DEFAULT_PHRASES
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % phrases.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [phrases])

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-1.5 rounded-full bg-current"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          />
        ))}
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={phrases[index]}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {phrases[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}
