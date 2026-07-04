"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format, parse } from "date-fns"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { markBillAsPaid } from "@/features/bills/actions"
import { PAYMENT_METHODS } from "@/features/bills/schemas"
import { PAYMENT_METHOD_LABELS } from "@/features/bills/bill-options"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import type { Bill } from "@/generated/prisma/client"

const formSchema = z.object({
  paidAt: z.string().min(1, "Informe a data"),
  paymentMethod: z.string(),
  paymentAccount: z.string(),
  note: z.string(),
})

type FormValues = z.infer<typeof formSchema>

export function MarkAsPaidDialog({
  bill,
  open,
  onOpenChange,
}: {
  bill: Bill
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paidAt: format(new Date(), "yyyy-MM-dd"),
      paymentMethod: "PIX",
      paymentAccount: "",
      note: "",
    },
  })

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await markBillAsPaid(bill.id, {
        paidAt: parse(values.paidAt, "yyyy-MM-dd", new Date()),
        paymentMethod: values.paymentMethod as (typeof PAYMENT_METHODS)[number],
        paymentAccount: values.paymentAccount || undefined,
        note: values.note || undefined,
      })

      if ("error" in result) {
        toast.error(result.error ?? "Não foi possível registrar o pagamento")
        return
      }

      toast.success("Conta marcada como paga")
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Marcar como paga</DialogTitle>
          <DialogDescription>{bill.name}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="paidAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data do pagamento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de pagamento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method} value={method}>
                          {PAYMENT_METHOD_LABELS[method]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentAccount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conta utilizada (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Nubank, Itaú" {...field} />
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
                Confirmar pagamento
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
