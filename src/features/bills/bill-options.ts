import {
  Banknote,
  Barcode,
  CreditCard,
  QrCode,
  Repeat,
  Wallet,
  Landmark,
  type LucideIcon,
} from "lucide-react"

import type { BillPriority, BillType, PaymentMethod, RecurrenceFrequency } from "@/generated/prisma/client"
import type { EffectiveBillStatus } from "@/features/bills/service"

export const BILL_TYPE_LABELS: Record<BillType, string> = {
  ONE_TIME: "À vista",
  INSTALLMENT: "Parcelada",
  RECURRING: "Recorrente",
}

export const BILL_PRIORITY_LABELS: Record<BillPriority, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  PIX: "Pix",
  CREDIT_CARD: "Cartão de crédito",
  DEBIT_CARD: "Cartão de débito",
  BOLETO: "Boleto",
  CASH: "Dinheiro",
  BANK_TRANSFER: "Transferência",
  OTHER: "Outro",
}

export const PAYMENT_METHOD_ICONS: Record<PaymentMethod, LucideIcon> = {
  PIX: QrCode,
  CREDIT_CARD: CreditCard,
  DEBIT_CARD: CreditCard,
  BOLETO: Barcode,
  CASH: Banknote,
  BANK_TRANSFER: Landmark,
  OTHER: Wallet,
}

export const RECURRENCE_FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  WEEKLY: "Semanal",
  MONTHLY: "Mensal",
  YEARLY: "Anual",
  CUSTOM: "Personalizada",
}

export const RECURRENCE_ICON: LucideIcon = Repeat

export const EFFECTIVE_STATUS_LABELS: Record<EffectiveBillStatus, string> = {
  PENDING: "Pendente",
  PAID: "Paga",
  OVERDUE: "Atrasada",
  CANCELLED: "Cancelada",
  SCHEDULED: "Agendada",
}
