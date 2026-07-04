"use client"

import { addDays, addWeeks, endOfWeek, isBefore, isSameDay, startOfDay } from "date-fns"
import { Receipt } from "lucide-react"
import { motion } from "motion/react"

import type { BillWithDetails } from "@/features/bills/queries"
import { BillCard } from "@/features/bills/components/BillCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { staggerContainer } from "@/lib/motion"
import type { Category } from "@/generated/prisma/client"

type GroupKey =
  | "Atrasadas"
  | "Hoje"
  | "Amanhã"
  | "Esta semana"
  | "Próxima semana"
  | "Depois"
  | "Pagas"
  | "Canceladas"

const GROUP_ORDER: GroupKey[] = [
  "Atrasadas",
  "Hoje",
  "Amanhã",
  "Esta semana",
  "Próxima semana",
  "Depois",
  "Pagas",
  "Canceladas",
]

function groupKeyFor(bill: BillWithDetails, today: Date): GroupKey {
  if (bill.effectiveStatus === "OVERDUE") return "Atrasadas"
  if (bill.effectiveStatus === "PAID") return "Pagas"
  if (bill.effectiveStatus === "CANCELLED") return "Canceladas"

  const todayStart = startOfDay(today)
  const tomorrow = addDays(todayStart, 1)
  const endThisWeek = endOfWeek(todayStart, { weekStartsOn: 1 })
  const endNextWeek = endOfWeek(addWeeks(todayStart, 1), { weekStartsOn: 1 })
  const due = startOfDay(bill.dueDate)

  if (isBefore(due, todayStart) || isSameDay(due, todayStart)) return "Hoje"
  if (isSameDay(due, tomorrow)) return "Amanhã"
  if (!isBefore(endThisWeek, due)) return "Esta semana"
  if (!isBefore(endNextWeek, due)) return "Próxima semana"
  return "Depois"
}

export function BillList({
  bills,
  categories,
}: {
  bills: BillWithDetails[]
  categories: Category[]
}) {
  if (bills.length === 0) {
    return (
      <EmptyState
        icon={<Receipt className="size-5" />}
        title="Nenhuma conta encontrada"
        description="Ajuste os filtros ou registre uma nova conta a pagar."
      />
    )
  }

  const today = new Date()
  const groups = new Map<GroupKey, BillWithDetails[]>()
  for (const bill of bills) {
    const key = groupKeyFor(bill, today)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(bill)
  }

  return (
    <div className="space-y-8">
      {GROUP_ORDER.filter((key) => groups.has(key)).map((key) => (
        <div key={key} className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">{key}</h3>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-2"
          >
            {groups.get(key)!.map((bill) => (
              <BillCard key={bill.id} bill={bill} categories={categories} />
            ))}
          </motion.div>
        </div>
      ))}
    </div>
  )
}
