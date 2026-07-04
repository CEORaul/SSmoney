import type { Transition, Variants } from "motion/react"

const EASE_OUT = [0.22, 1, 0.36, 1] as const

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE_OUT },
  },
}

/** Shared spring for elements that "respond" to interaction (active pills, open/close). */
export const springTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
}

/** whileTap preset for clickable buttons/cards — a subtle press, never a bounce. */
export const scaleOnTap = { scale: 0.98 }
