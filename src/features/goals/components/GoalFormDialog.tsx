"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format, parse } from "date-fns"
import { useState, useTransition, type ReactNode } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { createGoal, updateGoal } from "@/features/goals/actions"
import { moneyAmountSchema } from "@/lib/validations/common"
import type { GoalInput } from "@/features/goals/schemas"
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
import type { Goal } from "@/generated/prisma/client"

const formSchema = z.object({
  name: z.string().min(1, "Informe um nome"),
  emoji: z.string(),
  targetAmount: moneyAmountSchema,
  targetDate: z.string(),
})

type FormValues = z.infer<typeof formSchema>

function toFormValues(goal?: Goal | null): FormValues {
  return {
    name: goal?.name ?? "",
    emoji: goal?.emoji ?? "",
    targetAmount: goal ? centsToAmount(goal.targetAmountCents) : 0,
    targetDate: goal?.targetDate ? format(goal.targetDate, "yyyy-MM-dd") : "",
  }
}

export function GoalFormDialog({
  goal,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: {
  goal?: Goal | null
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = controlledOpen ?? uncontrolledOpen
  const [isPending, startTransition] = useTransition()
  const isEditing = !!goal

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: toFormValues(goal),
  })

  function onOpenChange(next: boolean) {
    setControlledOpen?.(next)
    setUncontrolledOpen(next)
    if (next) {
      form.reset(toFormValues(goal))
    }
  }

  function onSubmit(values: FormValues) {
    const input: GoalInput = {
      name: values.name,
      emoji: values.emoji || undefined,
      targetAmount: values.targetAmount,
      targetDate: values.targetDate
        ? parse(values.targetDate, "yyyy-MM-dd", new Date())
        : undefined,
    }

    startTransition(async () => {
      const result = isEditing
        ? await updateGoal(goal!.id, input)
        : await createGoal(input)

      if ("error" in result) {
        toast.error(result.error ?? "Não foi possível salvar")
        return
      }

      toast.success(isEditing ? "Meta atualizada" : "Meta criada")
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar meta" : "Nova meta"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os detalhes da sua meta"
              : "Defina um objetivo para guardar dinheiro"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-[80px_1fr] gap-4">
              <FormField
                control={form.control}
                name="emoji"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emoji</FormLabel>
                    <FormControl>
                      <Input placeholder="🎯" maxLength={4} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="targetAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor alvo (R$)</FormLabel>
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
              name="targetDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data alvo (opcional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
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
