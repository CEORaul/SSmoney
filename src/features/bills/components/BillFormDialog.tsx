"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format, parse } from "date-fns"
import { useState, useTransition, type ReactNode } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import {
  createBill,
  createInstallmentBill,
  createRecurringBill,
  updateBill,
  updateBillSeries,
} from "@/features/bills/actions"
import { BILL_PRIORITIES, RECURRENCE_FREQUENCIES, type BillInput } from "@/features/bills/schemas"
import { SeriesEditScopeDialog } from "@/features/bills/components/SeriesEditScopeDialog"
import {
  BILL_PRIORITY_LABELS,
  BILL_TYPE_LABELS,
  RECURRENCE_FREQUENCY_LABELS,
} from "@/features/bills/bill-options"
import { centsToAmount } from "@/lib/money"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Bill, BillType, Category } from "@/generated/prisma/client"

const BILL_TYPES: BillType[] = ["ONE_TIME", "INSTALLMENT", "RECURRING"]

const formSchema = z.object({
  billType: z.enum(["ONE_TIME", "INSTALLMENT", "RECURRING"]),
  name: z.string().min(1, "Informe um nome"),
  description: z.string(),
  note: z.string(),
  categoryId: z.string(),
  priority: z.enum(BILL_PRIORITIES),
  tags: z.string(),
  amount: z.number(),
  dueDate: z.string(),
  totalAmount: z.number(),
  installmentCount: z.number().int().min(2).max(60),
  firstDueDate: z.string(),
  recurrenceFrequency: z.enum(RECURRENCE_FREQUENCIES),
})

type FormValues = z.infer<typeof formSchema>

function toFormValues(bill?: Bill | null): FormValues {
  const today = format(new Date(), "yyyy-MM-dd")
  return {
    billType: bill?.type ?? "ONE_TIME",
    name: bill?.name ?? "",
    description: bill?.description ?? "",
    note: bill?.note ?? "",
    categoryId: bill?.categoryId ?? "",
    priority: bill?.priority ?? "MEDIUM",
    tags: bill?.tags?.join(", ") ?? "",
    amount: bill ? centsToAmount(bill.amountCents) : 0,
    dueDate: bill ? format(bill.dueDate, "yyyy-MM-dd") : today,
    totalAmount: bill ? centsToAmount(bill.amountCents) : 0,
    installmentCount: bill?.installmentTotal ?? 2,
    firstDueDate: bill ? format(bill.dueDate, "yyyy-MM-dd") : today,
    recurrenceFrequency: bill?.recurrenceFrequency ?? "MONTHLY",
  }
}

export function BillFormDialog({
  categories,
  bill,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: {
  categories: Category[]
  bill?: Bill | null
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = controlledOpen ?? uncontrolledOpen
  const [isPending, startTransition] = useTransition()
  const isEditing = !!bill
  const [pendingSeriesInput, setPendingSeriesInput] = useState<BillInput | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: toFormValues(bill),
  })

  const billType = form.watch("billType")
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE")
  const isInstallmentCreate = billType === "INSTALLMENT" && !isEditing

  function onOpenChange(next: boolean) {
    setControlledOpen?.(next)
    setUncontrolledOpen(next)
    if (next) {
      form.reset(toFormValues(bill))
    }
  }

  function onSubmit(values: FormValues) {
    const shared = {
      name: values.name,
      description: values.description || undefined,
      note: values.note || undefined,
      categoryId: values.categoryId || undefined,
      priority: values.priority,
      tags: values.tags
        ? values.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    }

    if (isEditing && bill!.seriesId) {
      setPendingSeriesInput({
        ...shared,
        amount: values.amount,
        dueDate: parse(values.dueDate, "yyyy-MM-dd", new Date()),
      })
      return
    }

    startTransition(async () => {
      const result = isEditing
        ? await updateBill(bill!.id, {
            ...shared,
            amount: values.amount,
            dueDate: parse(values.dueDate, "yyyy-MM-dd", new Date()),
          })
        : values.billType === "INSTALLMENT"
          ? await createInstallmentBill({
              ...shared,
              totalAmount: values.totalAmount,
              installmentCount: values.installmentCount,
              firstDueDate: parse(values.firstDueDate, "yyyy-MM-dd", new Date()),
            })
          : values.billType === "RECURRING"
            ? await createRecurringBill({
                ...shared,
                amount: values.amount,
                dueDate: parse(values.dueDate, "yyyy-MM-dd", new Date()),
                recurrenceFrequency: values.recurrenceFrequency,
              })
            : await createBill({
                ...shared,
                amount: values.amount,
                dueDate: parse(values.dueDate, "yyyy-MM-dd", new Date()),
              })

      if ("error" in result) {
        toast.error(result.error ?? "Não foi possível salvar")
        return
      }

      toast.success(isEditing ? "Conta atualizada" : "Conta criada")
      onOpenChange(false)
    })
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar conta" : "Nova conta a pagar"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os detalhes desta conta"
              : "Registre uma conta à vista, parcelada ou recorrente"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!isEditing && (
              <Tabs
                value={billType}
                onValueChange={(value) => form.setValue("billType", value as BillType)}
              >
                <TabsList className="grid w-full grid-cols-3">
                  {BILL_TYPES.map((type) => (
                    <TabsTrigger key={type} value={type}>
                      {BILL_TYPE_LABELS[type]}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Internet, Aluguel, Notebook" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isInstallmentCreate ? (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor total (R$)</FormLabel>
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
                  name="installmentCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parcelas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="2"
                          max="60"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
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
            )}

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria (opcional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={isInstallmentCreate ? "firstDueDate" : "dueDate"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isInstallmentCreate ? "Vencimento da 1ª parcela" : "Vencimento"}
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BILL_PRIORITIES.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {BILL_PRIORITY_LABELS[priority]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {billType === "RECURRING" && !isEditing && (
              <FormField
                control={form.control}
                name="recurrenceFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequência</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {RECURRENCE_FREQUENCIES.map((frequency) => (
                          <SelectItem key={frequency} value={frequency}>
                            {RECURRENCE_FREQUENCY_LABELS[frequency]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (opcional, separadas por vírgula)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: casa, essencial" {...field} />
                  </FormControl>
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

            <DialogFooter>
              <Button type="submit" loading={isPending}>
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

    {pendingSeriesInput && bill && (bill.type === "INSTALLMENT" || bill.type === "RECURRING") && (
      <SeriesEditScopeDialog
        open
        onOpenChange={(next) => {
          if (!next) {
            setPendingSeriesInput(null)
            onOpenChange(false)
          }
        }}
        billType={bill.type}
        successVerb="atualizada"
        onConfirm={(scope) => updateBillSeries(bill.id, scope, pendingSeriesInput)}
      />
    )}
    </>
  )
}
