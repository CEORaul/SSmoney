"use client"

import type { ReactNode } from "react"
import { motion } from "motion/react"

import { fadeInUp } from "@/lib/motion"

/**
 * Reveals content as it enters the viewport, instead of animating
 * everything at once on mount. Used for below-the-fold sections.
 */
export function ScrollReveal({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeInUp}
      className={className}
    >
      {children}
    </motion.div>
  )
}
