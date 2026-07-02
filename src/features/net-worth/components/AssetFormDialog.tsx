"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format, parse } from "date-fns"
import { useState, useTransition, type ReactNode } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { createAsset, updateAsset } from "@/features/net-worth/actions"
import { ASSET_TYPE_LABELS, ASSET_TYPES_ORDER } from "@/features/net-worth/asset-types"
import { moneyAmountSchema } from "@/lib/validations/common"
import type { AssetInput } from "@/features/net-worth/schemas"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Asset } from "@/generated/prisma/client"

const formSchema = z.object({
  name: z.string().min(1, "Informe um nome"),
  type: z.enum(["CASH", "INVESTMENT", "PROPERTY", "VEHICLE", "DEBT", "OTHER"]),
  value: moneyAmountSchema,
  asOfDate: z.string().min(1, "Informe uma data"),
})

type FormValues = z.infer<typeof formSchema>

function toFormValues(asset?: Asset | null): FormValues {
  return {
    name: asset?.name ?? "",
    type: asset?.type ?? "CASH",
    value: asset ? centsToAmount(asset.valueCents) : 0,
    asOfDate: format(asset?.asOfDate ?? new Date(), "yyyy-MM-dd"),
  }
}

export function AssetFormDialog({
  asset,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: {
  asset?: Asset | null
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = controlledOpen ?? uncontrolledOpen
  const [isPending, startTransition] = useTransition()
  const isEditing = !!asset

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: toFormValues(asset),
  })

  function onOpenChange(next: boolean) {
    setControlledOpen?.(next)
    setUncontrolledOpen(next)
    if (next) {
      form.reset(toFormValues(asset))
    }
  }

  function onSubmit(values: FormValues) {
    const input: AssetInput = {
      name: values.name,
      type: values.type,
      value: values.value,
      asOfDate: parse(values.asOfDate, "yyyy-MM-dd", new Date()),
    }

    startTransition(async () => {
      const result = isEditing
        ? await updateAsset(asset!.id, input)
        : await createAsset(input)

      if ("error" in result) {
        toast.error(result.error ?? "Não foi possível salvar")
        return
      }

      toast.success(isEditing ? "Ativo atualizado" : "Ativo criado")
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar ativo" : "Novo ativo"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os detalhes desse ativo"
              : "Registre manualmente um ativo ou dívida"}
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ASSET_TYPES_ORDER.map((type) => (
                        <SelectItem key={type} value={type}>
                          {ASSET_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Valor (R$){" "}
                    {form.watch("type") === "DEBT" && (
                      <span className="text-muted-foreground">— quanto você deve</span>
                    )}
                  </FormLabel>
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
              name="asOfDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de referência</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
