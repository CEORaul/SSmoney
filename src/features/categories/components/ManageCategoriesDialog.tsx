"use client"

import { Plus } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CategoryFormDialog } from "@/features/categories/components/CategoryFormDialog"
import { CategoryGroup } from "@/features/categories/components/CategoryGroup"
import type { Category } from "@/generated/prisma/client"

/**
 * Categories no longer have a dedicated sidebar page — they're managed from
 * wherever a category is actually picked (transaction form, transactions
 * page toolbar). Reuses CategoryGroup/CategoryFormDialog as-is; this is just
 * the modal shell that used to be features/categories's page.tsx.
 */
export function ManageCategoriesDialog({
  categories,
  trigger,
}: {
  categories: Category[]
  trigger: ReactNode
}) {
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE")
  const incomeCategories = categories.filter((c) => c.type === "INCOME")

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerenciar categorias</DialogTitle>
          <DialogDescription>
            Organize suas receitas e despesas por categoria
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <CategoryFormDialog
            trigger={
              <Button size="sm">
                <Plus className="size-4" />
                Nova categoria
              </Button>
            }
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <CategoryGroup title="Despesas" categories={expenseCategories} />
          <CategoryGroup title="Receitas" categories={incomeCategories} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
