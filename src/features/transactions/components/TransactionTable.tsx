"use client"

import { useState, useTransition } from "react"
import { MoreHorizontal, Pencil, Receipt, Trash2 } from "lucide-react"
import { motion } from "motion/react"
import { toast } from "sonner"

import { deleteTransaction } from "@/features/transactions/actions"
import { TransactionFormDialog } from "@/features/transactions/components/TransactionFormDialog"
import { formatCurrency } from "@/lib/money"
import { formatDate } from "@/lib/date"
import { fadeInUp, staggerContainer } from "@/lib/motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/shared/EmptyState"
import type {
  Category,
  Transaction,
} from "@/generated/prisma/client"

type TransactionWithCategory = Transaction & { category: Category | null }

export function TransactionTable({
  transactions,
  categories,
  allCategories,
}: {
  transactions: TransactionWithCategory[]
  categories: Category[]
  allCategories?: Category[]
}) {
  const [isPending, startTransition] = useTransition()
  const [editingTransaction, setEditingTransaction] =
    useState<TransactionWithCategory | null>(null)

  function onDelete(id: string) {
    startTransition(async () => {
      const result = await deleteTransaction(id)
      if ("error" in result) {
        toast.error(result.error ?? "Não foi possível excluir")
        return
      }
      toast.success("Transação excluída")
    })
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<Receipt className="size-5" />}
        title="Nenhuma transação encontrada"
        description="Ajuste os filtros ou registre uma nova receita ou despesa."
      />
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <motion.tbody
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="[&_tr:last-child]:border-0"
        >
          {transactions.map((transaction) => (
            <motion.tr
              key={transaction.id}
              variants={fadeInUp}
              className="border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted"
            >
              <TableCell>
                <div className="font-medium">{transaction.description}</div>
                {!transaction.isPaid && (
                  <Badge variant="outline" className="mt-1">
                    Pendente
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {transaction.category?.name ?? "Sem categoria"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(transaction.date)}
              </TableCell>
              <TableCell
                className={`text-right font-mono font-medium tabular-nums ${
                  transaction.type === "INCOME"
                    ? "text-positive"
                    : "text-foreground"
                }`}
              >
                {transaction.type === "INCOME" ? "+" : "-"}
                {formatCurrency(transaction.amountCents, transaction.currency)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isPending}>
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={() => setEditingTransaction(transaction)}
                    >
                      <Pencil className="mr-2 size-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(transaction.id)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </motion.tr>
          ))}
        </motion.tbody>
      </Table>
      {editingTransaction && (
        <TransactionFormDialog
          categories={categories}
          allCategories={allCategories}
          transaction={editingTransaction}
          open={!!editingTransaction}
          onOpenChange={(open) => !open && setEditingTransaction(null)}
        />
      )}
    </div>
  )
}
