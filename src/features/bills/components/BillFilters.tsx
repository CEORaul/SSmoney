"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"

import { PAYMENT_METHODS } from "@/features/bills/schemas"
import { BILL_TYPE_LABELS, EFFECTIVE_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/features/bills/bill-options"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { BillType, Category } from "@/generated/prisma/client"

const ALL = "all"
const STATUSES = ["PENDING", "OVERDUE", "SCHEDULED", "PAID", "CANCELLED"] as const
const TYPES: BillType[] = ["ONE_TIME", "INSTALLMENT", "RECURRING"]

export function BillFilters({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === ALL) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete("page")
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <Input
        placeholder="Buscar por nome, descrição ou observação..."
        defaultValue={searchParams.get("search") ?? ""}
        onChange={(e) => setParam("search", e.target.value)}
        className="sm:max-w-xs"
      />
      <Select
        defaultValue={searchParams.get("status") ?? ALL}
        onValueChange={(value) => setParam("status", value)}
      >
        <SelectTrigger className="sm:w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos os status</SelectItem>
          {STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {EFFECTIVE_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        defaultValue={searchParams.get("type") ?? ALL}
        onValueChange={(value) => setParam("type", value)}
      >
        <SelectTrigger className="sm:w-40">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos os tipos</SelectItem>
          {TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {BILL_TYPE_LABELS[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        defaultValue={searchParams.get("categoryId") ?? ALL}
        onValueChange={(value) => setParam("categoryId", value)}
      >
        <SelectTrigger className="sm:w-48">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todas as categorias</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        defaultValue={searchParams.get("paymentMethod") ?? ALL}
        onValueChange={(value) => setParam("paymentMethod", value)}
      >
        <SelectTrigger className="sm:w-44">
          <SelectValue placeholder="Forma de pagamento" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todas as formas</SelectItem>
          {PAYMENT_METHODS.map((method) => (
            <SelectItem key={method} value={method}>
              {PAYMENT_METHOD_LABELS[method]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
