"use server"

import { randomUUID } from "node:crypto"
import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth/session"
import { amountToCents } from "@/lib/money"
import {
  billSchema,
  installmentBillSchema,
  markAsPaidSchema,
  recurringBillSchema,
  seriesEditScopeSchema,
  type BillInput,
  type InstallmentBillInput,
  type MarkAsPaidInput,
  type RecurringBillInput,
  type SeriesEditScopeInput,
} from "@/features/bills/schemas"
import {
  generateRecurrenceDates,
  resolveSeriesScope,
  shiftDueDateDay,
  splitInstallments,
} from "@/features/bills/service"
import type { Bill } from "@/generated/prisma/client"

type ActionResult = { error?: string } | { success: true }
type SeriesActionResult = { error?: string } | { success: true; affectedCount: number }

function buildBillUpdateData(input: BillInput) {
  return {
    name: input.name,
    description: input.description || undefined,
    note: input.note || undefined,
    amountCents: amountToCents(input.amount),
    categoryId: input.categoryId || undefined,
    dueDate: input.dueDate,
    priority: input.priority,
    tags: input.tags,
  }
}

/** The group id that identifies `bill`'s series, whichever field carries it. */
function seriesKeyOf(bill: Pick<Bill, "seriesId" | "installmentGroupId" | "recurrenceGroupId">) {
  return bill.seriesId ?? bill.installmentGroupId ?? bill.recurrenceGroupId
}

async function fetchSeriesBills(profileId: string, id: string) {
  const target = await prisma.bill.findFirst({ where: { id, profileId } })
  if (!target) return null

  const seriesKey = seriesKeyOf(target)
  const seriesBills = seriesKey
    ? await prisma.bill.findMany({
        where: {
          profileId,
          OR: [{ seriesId: seriesKey }, { installmentGroupId: seriesKey }, { recurrenceGroupId: seriesKey }],
        },
      })
    : [target]

  return { target, seriesBills }
}

function revalidateBills() {
  revalidatePath("/bills")
  revalidatePath("/dashboard")
}

export async function createBill(input: BillInput): Promise<ActionResult> {
  const parsed = billSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const profile = await requireUser()

  await prisma.bill.create({
    data: {
      profileId: profile.id,
      name: parsed.data.name,
      description: parsed.data.description || undefined,
      note: parsed.data.note || undefined,
      amountCents: amountToCents(parsed.data.amount),
      categoryId: parsed.data.categoryId || undefined,
      dueDate: parsed.data.dueDate,
      priority: parsed.data.priority,
      tags: parsed.data.tags,
      type: "ONE_TIME",
    },
  })

  revalidateBills()
  return { success: true }
}

export async function createInstallmentBill(input: InstallmentBillInput): Promise<ActionResult> {
  const parsed = installmentBillSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const profile = await requireUser()
  const totalCents = amountToCents(parsed.data.totalAmount)
  const amounts = splitInstallments(totalCents, parsed.data.installmentCount)
  const dueDates = generateRecurrenceDates(
    parsed.data.firstDueDate,
    "MONTHLY",
    parsed.data.installmentCount
  )
  const groupId = randomUUID()

  await prisma.bill.createMany({
    data: amounts.map((amountCents, index) => ({
      profileId: profile.id,
      name: parsed.data.name,
      description: parsed.data.description || undefined,
      note: parsed.data.note || undefined,
      amountCents,
      categoryId: parsed.data.categoryId || undefined,
      dueDate: dueDates[index],
      priority: parsed.data.priority,
      tags: parsed.data.tags,
      type: "INSTALLMENT" as const,
      installmentGroupId: groupId,
      installmentNumber: index + 1,
      installmentTotal: parsed.data.installmentCount,
      seriesId: groupId,
    })),
  })

  revalidateBills()
  return { success: true }
}

export async function createRecurringBill(input: RecurringBillInput): Promise<ActionResult> {
  const parsed = recurringBillSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const profile = await requireUser()
  const amountCents = amountToCents(parsed.data.amount)
  const dueDates = generateRecurrenceDates(parsed.data.dueDate, parsed.data.recurrenceFrequency)
  const groupId = randomUUID()

  await prisma.bill.createMany({
    data: dueDates.map((dueDate, index) => ({
      profileId: profile.id,
      name: parsed.data.name,
      description: parsed.data.description || undefined,
      note: parsed.data.note || undefined,
      amountCents,
      categoryId: parsed.data.categoryId || undefined,
      dueDate,
      priority: parsed.data.priority,
      tags: parsed.data.tags,
      type: "RECURRING" as const,
      recurrenceGroupId: groupId,
      recurrenceFrequency: parsed.data.recurrenceFrequency,
      recurrenceRule: parsed.data.recurrenceRule || undefined,
      recurrenceIndex: index,
      seriesId: groupId,
    })),
  })

  revalidateBills()
  return { success: true }
}

export async function updateBill(id: string, input: BillInput): Promise<ActionResult> {
  const parsed = billSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const profile = await requireUser()

  await prisma.bill.updateMany({
    where: { id, profileId: profile.id },
    data: buildBillUpdateData(parsed.data),
  })

  revalidateBills()
  return { success: true }
}

/**
 * Series-aware counterpart of `updateBill` — for installment/recurring bills,
 * applies the same field changes to "this / this and future / all" of the
 * series depending on `scope`, reusing `resolveSeriesScope` so future/all
 * never touch a PAID or CANCELLED bill. Bills without a series (ONE_TIME)
 * fall back to acting on just the one row, same as `updateBill`.
 */
export async function updateBillSeries(
  id: string,
  scope: SeriesEditScopeInput,
  input: BillInput
): Promise<SeriesActionResult> {
  const parsedScope = seriesEditScopeSchema.safeParse(scope)
  const parsed = billSchema.safeParse(input)
  if (!parsedScope.success) {
    return { error: "Escopo inválido" }
  }
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const profile = await requireUser()

  const found = await fetchSeriesBills(profile.id, id)
  if (!found) {
    return { error: "Conta não encontrada" }
  }

  const affectedIds = resolveSeriesScope(found.seriesBills, found.target, parsedScope.data)

  if (parsedScope.data === "this") {
    const result = await prisma.bill.updateMany({
      where: { id: { in: affectedIds }, profileId: profile.id },
      data: buildBillUpdateData(parsed.data),
    })
    revalidateBills()
    return { success: true, affectedCount: result.count }
  }

  // "future"/"all": shared fields (name, amount, category, priority, tags,
  // note) apply uniformly, but the due date is never collapsed onto one
  // literal date across the series. If the user actually changed the day,
  // shift each affected bill's day-of-month while keeping its own month/year
  // — "todo dia 10 -> todo dia 15" should move every future due date's day,
  // not overwrite them all with the exact same date.
  const { dueDate: _dueDate, ...sharedFields } = buildBillUpdateData(parsed.data)
  const dayChanged = parsed.data.dueDate.getDate() !== found.target.dueDate.getDate()
  const affectedBills = found.seriesBills.filter((b) => affectedIds.includes(b.id))

  const results = await prisma.$transaction(
    affectedBills.map((bill) =>
      prisma.bill.update({
        where: { id: bill.id },
        data: {
          ...sharedFields,
          ...(dayChanged ? { dueDate: shiftDueDateDay(bill.dueDate, parsed.data.dueDate) } : {}),
        },
      })
    )
  )

  revalidateBills()
  return { success: true, affectedCount: results.length }
}

export async function markBillAsPaid(id: string, input: MarkAsPaidInput): Promise<ActionResult> {
  const parsed = markAsPaidSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const profile = await requireUser()

  const bill = await prisma.bill.findFirst({ where: { id, profileId: profile.id } })
  if (!bill) {
    return { error: "Conta não encontrada" }
  }
  if (bill.status === "PAID") {
    return { error: "Esta conta já foi paga" }
  }

  await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        profileId: profile.id,
        categoryId: bill.categoryId,
        type: "EXPENSE",
        amountCents: bill.amountCents,
        description: bill.name,
        note: parsed.data.note || bill.note || undefined,
        date: parsed.data.paidAt,
        dueDate: bill.dueDate,
        isPaid: true,
      },
    })

    await tx.bill.update({
      where: { id: bill.id },
      data: {
        status: "PAID",
        paidAt: parsed.data.paidAt,
        paymentMethod: parsed.data.paymentMethod,
        paymentAccount: parsed.data.paymentAccount || undefined,
        note: parsed.data.note || bill.note,
        transactionId: transaction.id,
      },
    })
  })

  revalidateBills()
  revalidatePath("/month-end")
  return { success: true }
}

export async function duplicateBill(id: string): Promise<ActionResult> {
  const profile = await requireUser()

  const bill = await prisma.bill.findFirst({ where: { id, profileId: profile.id } })
  if (!bill) {
    return { error: "Conta não encontrada" }
  }

  await prisma.bill.create({
    data: {
      profileId: profile.id,
      categoryId: bill.categoryId,
      name: bill.name,
      description: bill.description,
      note: bill.note,
      amountCents: bill.amountCents,
      currency: bill.currency,
      type: "ONE_TIME",
      priority: bill.priority,
      tags: bill.tags,
      dueDate: bill.dueDate,
    },
  })

  revalidateBills()
  return { success: true }
}

export async function cancelBill(id: string): Promise<ActionResult> {
  const profile = await requireUser()

  await prisma.bill.updateMany({
    where: { id, profileId: profile.id, status: { not: "PAID" } },
    data: { status: "CANCELLED" },
  })

  revalidateBills()
  return { success: true }
}

/** Series-aware counterpart of `cancelBill` — see `updateBillSeries` for the scope semantics. */
export async function cancelBillSeries(id: string, scope: SeriesEditScopeInput): Promise<SeriesActionResult> {
  const parsedScope = seriesEditScopeSchema.safeParse(scope)
  if (!parsedScope.success) {
    return { error: "Escopo inválido" }
  }

  const profile = await requireUser()

  const found = await fetchSeriesBills(profile.id, id)
  if (!found) {
    return { error: "Conta não encontrada" }
  }

  const affectedIds = resolveSeriesScope(found.seriesBills, found.target, parsedScope.data)

  const result = await prisma.bill.updateMany({
    where: { id: { in: affectedIds }, profileId: profile.id, status: { not: "PAID" } },
    data: { status: "CANCELLED" },
  })

  revalidateBills()
  return { success: true, affectedCount: result.count }
}

export async function deleteBill(id: string): Promise<ActionResult> {
  const profile = await requireUser()

  const bill = await prisma.bill.findFirst({ where: { id, profileId: profile.id } })
  if (!bill) {
    return { error: "Conta não encontrada" }
  }

  await prisma.bill.delete({ where: { id } })

  revalidateBills()
  return { success: true }
}

/** Series-aware counterpart of `deleteBill` — see `updateBillSeries` for the scope semantics. */
export async function deleteBillSeries(id: string, scope: SeriesEditScopeInput): Promise<SeriesActionResult> {
  const parsedScope = seriesEditScopeSchema.safeParse(scope)
  if (!parsedScope.success) {
    return { error: "Escopo inválido" }
  }

  const profile = await requireUser()

  const found = await fetchSeriesBills(profile.id, id)
  if (!found) {
    return { error: "Conta não encontrada" }
  }

  const affectedIds = resolveSeriesScope(found.seriesBills, found.target, parsedScope.data)

  const result = await prisma.bill.deleteMany({
    where: { id: { in: affectedIds }, profileId: profile.id },
  })

  revalidateBills()
  return { success: true, affectedCount: result.count }
}
