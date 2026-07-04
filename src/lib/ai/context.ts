import "server-only"

import { formatCurrency } from "@/lib/money"
import { formatDate, toYearMonth } from "@/lib/date"
import { getDashboardData } from "@/features/dashboard/queries"
import { listGoals } from "@/features/goals/queries"
import { getBillsSummary, getBillsTimeline } from "@/features/bills/queries"
import { getEffectiveStatus } from "@/features/bills/service"
import { getNetWorthSummary, listAssets } from "@/features/net-worth/queries"
import { getMonthClosing } from "@/features/month-end/queries"
import { getYearRetrospective } from "@/features/retrospective/queries"
import { listAllCategories } from "@/features/categories/queries"
import type { AIChatContext } from "@/lib/ai/types"

export type Topic =
  | "overview"
  | "goals"
  | "bills"
  | "netWorth"
  | "monthClosing"
  | "retrospective"
  | "categories"

async function buildOverview(): Promise<string> {
  const dashboard = await getDashboardData()
  const { currency } = dashboard

  const lines: string[] = [
    `Mês atual: ${dashboard.monthLabel}.`,
    `Saldo total (todas as transações): ${formatCurrency(dashboard.balanceCents, currency)}.`,
  ]

  if (dashboard.monthIncomeCents > 0 || dashboard.monthExpenseCents > 0) {
    lines.push(
      `Neste mês: receitas de ${formatCurrency(dashboard.monthIncomeCents, currency)}, despesas de ${formatCurrency(dashboard.monthExpenseCents, currency)}, economia de ${formatCurrency(dashboard.monthSavingsCents, currency)}.`
    )
  } else {
    lines.push("Nenhuma transação registrada neste mês ainda.")
  }

  if (dashboard.categoryBreakdown.length > 0) {
    const top = dashboard.categoryBreakdown
      .slice(0, 5)
      .map((c) => `${c.name}: ${formatCurrency(c.amountCents, currency)}`)
      .join(", ")
    lines.push(`Despesas por categoria este mês, da maior para a menor: ${top}.`)
  }

  if (dashboard.evolution.length > 0) {
    const evolution = dashboard.evolution
      .map((m) => `${m.label}: economia de ${formatCurrency(m.incomeCents - m.expenseCents, currency)}`)
      .join("; ")
    lines.push(`Evolução dos últimos meses: ${evolution}.`)
  }

  return lines.join("\n")
}

async function buildGoals(): Promise<string> {
  const goals = await listGoals()
  const activeGoals = goals.filter((g) => g.status === "ACTIVE")

  if (activeGoals.length === 0) {
    return "O usuário ainda não cadastrou nenhuma meta."
  }

  return activeGoals
    .map((g) => {
      const remainingCents = g.targetAmountCents - g.currentAmountCents
      const percent =
        g.targetAmountCents > 0
          ? Math.round((g.currentAmountCents / g.targetAmountCents) * 100)
          : 0
      const deadline = g.targetDate ? `, prazo em ${formatDate(g.targetDate)}` : ""
      return `"${g.name}": ${formatCurrency(g.currentAmountCents)} de ${formatCurrency(g.targetAmountCents)} guardados (${percent}%), faltam ${formatCurrency(remainingCents)}${deadline}.`
    })
    .join("\n")
}

async function buildBills(): Promise<{ billsSummary: string; overdueBillsSummary: string; recurringBillsSummary: string }> {
  const [summary, timeline] = await Promise.all([getBillsSummary(), getBillsTimeline()])
  const { currency } = summary.nextUpcoming ?? { currency: "BRL" }

  const billsLines: string[] = [
    `Contas a pagar este mês: ${summary.paidCount} de ${summary.totalCount} já pagas (${summary.paidPercent}%). Valor pago: ${formatCurrency(summary.paidAmountCents, currency)}. Ainda falta pagar: ${formatCurrency(summary.pendingAmountCents, currency)}.`,
  ]

  const dueThisWeek = [...timeline.hoje, ...timeline.amanha, ...timeline.estaSemana]
  if (dueThisWeek.length > 0) {
    const list = dueThisWeek
      .map((b) => `${b.name} (${formatCurrency(b.amountCents, b.currency)}, vence ${formatDate(b.dueDate)})`)
      .join(", ")
    billsLines.push(`Contas vencendo esta semana: ${list}.`)
  } else {
    billsLines.push("Nenhuma conta vencendo esta semana.")
  }

  const allTimelineBills = [
    ...timeline.hoje,
    ...timeline.amanha,
    ...timeline.estaSemana,
    ...timeline.proximaSemana,
    ...timeline.depois,
  ]

  const overdue = allTimelineBills.filter((b) => getEffectiveStatus(b) === "OVERDUE")
  const overdueBillsSummary =
    overdue.length > 0
      ? `Contas vencidas (não pagas e com data de vencimento no passado): ${overdue
          .map((b) => `${b.name} (${formatCurrency(b.amountCents, b.currency)}, venceu ${formatDate(b.dueDate)})`)
          .join(", ")}.`
      : "Nenhuma conta vencida no momento."

  const recurring = allTimelineBills.filter((b) => b.recurrenceGroupId != null)
  const recurringBillsSummary =
    recurring.length > 0
      ? `Contas recorrentes pendentes: ${recurring
          .map((b) => `${b.name} (${formatCurrency(b.amountCents, b.currency)})`)
          .join(", ")}.`
      : "Nenhuma conta recorrente pendente no momento."

  return { billsSummary: billsLines.join("\n"), overdueBillsSummary, recurringBillsSummary }
}

async function buildNetWorth(): Promise<string> {
  const [netWorth, assets] = await Promise.all([getNetWorthSummary(), listAssets()])

  if (!netWorth.hasAssets) {
    return "O usuário ainda não cadastrou nenhum ativo, investimento ou dívida."
  }

  const lines: string[] = [`Patrimônio líquido total: ${formatCurrency(netWorth.totalCents, netWorth.currency)}.`]

  const byType = (type: string) => assets.filter((a) => a.type === type)
  const investments = byType("INVESTMENT")
  const debts = byType("DEBT")
  const others = assets.filter((a) => a.type !== "INVESTMENT" && a.type !== "DEBT")

  if (investments.length > 0) {
    lines.push(
      `Investimentos: ${investments.map((a) => `${a.name} (${formatCurrency(a.valueCents, a.currency)})`).join(", ")}.`
    )
  }
  if (debts.length > 0) {
    lines.push(
      `Dívidas: ${debts.map((a) => `${a.name} (${formatCurrency(a.valueCents, a.currency)})`).join(", ")}.`
    )
  }
  if (others.length > 0) {
    lines.push(
      `Outros ativos: ${others.map((a) => `${a.name} (${formatCurrency(a.valueCents, a.currency)})`).join(", ")}.`
    )
  }

  return lines.join("\n")
}

async function buildMonthClosing(): Promise<string> {
  const closing = await getMonthClosing(toYearMonth(new Date()))

  const lines: string[] = [
    `Fechamento de ${closing.monthLabel}${closing.isClosed ? " (mês fechado)" : " (mês em andamento)"}: receitas ${formatCurrency(closing.totalIncomeCents)}, despesas ${formatCurrency(closing.totalExpenseCents)}, economia ${formatCurrency(closing.totalSavingsCents)}.`,
    `Mês anterior: economia de ${formatCurrency(closing.previous.totalSavingsCents)}.`,
  ]

  if (closing.topGainer) {
    lines.push(`Categoria que mais aumentou o gasto: ${closing.topGainer.name} (+${formatCurrency(closing.topGainer.deltaCents)}).`)
  }
  if (closing.topShrink) {
    lines.push(`Categoria que mais reduziu o gasto: ${closing.topShrink.name} (${formatCurrency(closing.topShrink.deltaCents)}).`)
  }

  return lines.join("\n")
}

async function buildRetrospective(): Promise<string> {
  const retro = await getYearRetrospective(new Date().getFullYear())

  if (retro.registeredCount === 0) {
    return `Nenhum mês registrado ainda em ${retro.year}.`
  }

  const lines: string[] = [`Retrospectiva de ${retro.year}: ${retro.registeredCount} de 12 meses com atividade registrada.`]
  if (retro.bestMonth) {
    lines.push(`Melhor mês: ${retro.bestMonth.monthLabel} (economia de ${formatCurrency(retro.bestMonth.totalSavingsCents)}).`)
  }
  if (retro.highestExpenseMonth) {
    lines.push(`Mês de maior gasto: ${retro.highestExpenseMonth.monthLabel} (${formatCurrency(retro.highestExpenseMonth.totalExpenseCents)}).`)
  }

  return lines.join("\n")
}

async function buildCategories(): Promise<string> {
  const categories = await listAllCategories()

  if (categories.length === 0) {
    return "O usuário ainda não tem categorias cadastradas."
  }

  const active = categories.filter((c) => !c.isArchived)
  return `Categorias cadastradas: ${active.map((c) => `${c.name} (${c.type === "INCOME" ? "receita" : "despesa"})`).join(", ")}.`
}

/**
 * Fetches only the sections requested in `topics`, reusing the same
 * queries the Dashboard/Bills/Goals/Net Worth/Month-End/Retrospective/
 * Categories pages already use. Nothing is fabricated; sections with no
 * data say so explicitly so the model can tell the user rather than guess.
 */
export async function buildFinancialContext(topics: Topic[]): Promise<AIChatContext> {
  const want = (t: Topic) => topics.includes(t)

  const [overview, goals, bills, netWorth, monthClosing, retrospective, categories] = await Promise.all([
    want("overview") ? buildOverview() : Promise.resolve(undefined),
    want("goals") ? buildGoals() : Promise.resolve(undefined),
    want("bills") ? buildBills() : Promise.resolve(undefined),
    want("netWorth") ? buildNetWorth() : Promise.resolve(undefined),
    want("monthClosing") ? buildMonthClosing() : Promise.resolve(undefined),
    want("retrospective") ? buildRetrospective() : Promise.resolve(undefined),
    want("categories") ? buildCategories() : Promise.resolve(undefined),
  ])

  return {
    recentTransactionsSummary: overview,
    goalsSummary: goals,
    billsSummary: bills?.billsSummary,
    overdueBillsSummary: bills?.overdueBillsSummary,
    recurringBillsSummary: bills?.recurringBillsSummary,
    netWorthSummary: netWorth,
    monthClosingSummary: monthClosing,
    retrospectiveSummary: retrospective,
    categoriesSummary: categories,
  }
}
