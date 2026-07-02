"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format, parse } from "date-fns"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { addContribution } from "@/features/goals/actions"
import { moneyAmountSchema } from "@/lib/validations/common"
import type { ContributionInput } from "@/features/goals/schemas"
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
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  amount: moneyAmountSchema,
  date: z.string().min(1, "Informe uma data"),
  note: z.string(),
})

type FormValues = z.infer<typeof formSchema>

function defaultValues(): FormValues {
  return {
    amount: 0,
    date: format(new Date(), "yyyy-MM-dd"),
    note: "",
  }
}

export function ContributionDialog({
  goalId,
  open,
  onOpenChange,
}: {
  goalId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues(),
  })

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (next) {
      form.reset(defaultValues())
    }
  }

  function onSubmit(values: FormValues) {
    const input: ContributionInput = {
      amount: values.amount,
      date: parse(values.date, "yyyy-MM-dd", new Date()),
      note: values.note || undefined,
    }

    startTransition(async () => {
      const result = await addContribution(goalId, input)

      if ("error" in result) {
        toast.error(result.error ?? "Não foi possível salvar")
        return
      }

      toast.success("Contribuição adicionada")
      handleOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova contribuição</DialogTitle>
          <DialogDescription>Registre um valor guardado para essa meta</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
