"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format, parse } from "date-fns"
import { useState, useTransition, type ReactNode } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { createTransaction, updateTransaction } from "@/features/transactions/actions"
import { moneyAmountSchema } from "@/lib/validations/common"
import type { TransactionInput } from "@/features/transactions/schemas"
import { centsToAmount } from "@/lib/money"
import { ManageCategoriesDialog } from "@/features/categories/components/ManageCategoriesDialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Category, Transaction } from "@/generated/prisma/client"

const formSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: moneyAmountSchema,
  categoryId: z.string(),
  description: z.string().min(1, "Informe uma descrição"),
  date: z.string().min(1, "Informe uma data"),
  note: z.string(),
  isPaid: z.boolean(),
  dueDate: z.string(),
})

type FormValues = z.infer<typeof formSchema>

function toFormValues(transaction?: Transaction | null): FormValues {
  return {
    type: transaction?.type ?? "EXPENSE",
    amount: transaction ? centsToAmount(transaction.amountCents) : 0,
    categoryId: transaction?.categoryId ?? "",
    description: transaction?.description ?? "",
    date: format(transaction?.date ?? new Date(), "yyyy-MM-dd"),
    note: transaction?.note ?? "",
    isPaid: transaction?.isPaid ?? true,
    dueDate: transaction?.dueDate ? format(transaction.dueDate, "yyyy-MM-dd") : "",
  }
}

export function TransactionFormDialog({
  categories,
  allCategories,
  transaction,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: {
  categories: Category[]
  /** Includes archived categories, for the "Gerenciar categorias" dialog. Falls back to `categories` if not provided. */
  allCategories?: Category[]
  transaction?: Transaction | null
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = controlledOpen ?? uncontrolledOpen
  const [isPending, startTransition] = useTransition()
  const isEditing = !!transaction

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: toFormValues(transaction),
  })

  const type = form.watch("type")

  function onOpenChange(next: boolean) {
    setControlledOpen?.(next)
    setUncontrolledOpen(next)
    if (next) {
      form.reset(toFormValues(transaction))
    }
  }

  function onSubmit(values: FormValues) {
    const input: TransactionInput = {
      ...values,
      categoryId: values.categoryId || undefined,
      note: values.note || undefined,
      date: parse(values.date, "yyyy-MM-dd", new Date()),
      dueDate: values.dueDate
        ? parse(values.dueDate, "yyyy-MM-dd", new Date())
        : undefined,
    }

    startTransition(async () => {
      const result = isEditing
        ? await updateTransaction(transaction!.id, input)
        : await createTransaction(input)

      if ("error" in result) {
        toast.error(result.error ?? "Não foi possível salvar")
        return
      }

      toast.success(isEditing ? "Transação atualizada" : "Transação criada")
      onOpenChange(false)
    })
  }

  const filteredCategories = categories.filter((c) => c.type === type)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar transação" : "Nova transação"}
          </DialogTitle>
          <DialogDescription>
            Registre uma receita ou despesa
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      form.setValue("categoryId", "")
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EXPENSE">Despesa</SelectItem>
                      <SelectItem value="INCOME">Receita</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Categoria</FormLabel>
                    <ManageCategoriesDialog
                      categories={allCategories ?? categories}
                      trigger={
                        <button
                          type="button"
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Gerenciar categorias
                        </button>
                      }
                    />
                  </div>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observação (opcional)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPaid"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <FormLabel className="mb-0">
                    {type === "EXPENSE" ? "Já foi pago" : "Já foi recebido"}
                  </FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {!form.watch("isPaid") && (
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de vencimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button type="submit" loading={isPending}>
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
