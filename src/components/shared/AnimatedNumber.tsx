"use client"

import { useEffect } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"

import { formatCurrency } from "@/lib/money"
import { cn } from "@/lib/utils"

/**
 * Hero "readout" treatment for financial figures — the app's numeral
 * signature. Counts from its previous value to a new one via a spring
 * (including an initial 0 → value reveal on mount) instead of jumping.
 */
export function AnimatedNumber({
  cents,
  currency = "BRL",
  className,
}: {
  cents: number
  currency?: string
  className?: string
}) {
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { stiffness: 110, damping: 22, mass: 0.6 })
  const display = useTransform(spring, (value) => formatCurrency(Math.round(value), currency))

  useEffect(() => {
    motionValue.set(cents)
  }, [cents, motionValue])

  return (
    <motion.span
      className={cn("font-mono tabular-nums tracking-tight", className)}
    >
      {display}
    </motion.span>
  )
}
