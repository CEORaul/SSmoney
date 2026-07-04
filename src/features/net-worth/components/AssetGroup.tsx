"use client"

import { useState, useTransition } from "react"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { motion } from "motion/react"
import { toast } from "sonner"

import { deleteAsset } from "@/features/net-worth/actions"
import { AssetFormDialog } from "@/features/net-worth/components/AssetFormDialog"
import { ASSET_TYPE_ICONS, ASSET_TYPE_LABELS } from "@/features/net-worth/asset-types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/money"
import { formatDate } from "@/lib/date"
import { fadeInUp, staggerContainer } from "@/lib/motion"
import type { Asset, AssetType } from "@/generated/prisma/client"

export function AssetGroup({
  type,
  assets,
  currency,
}: {
  type: AssetType
  assets: Asset[]
  currency: string
}) {
  const Icon = ASSET_TYPE_ICONS[type]
  const total = assets.reduce((sum, a) => sum + a.valueCents, 0)

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="size-4 text-muted-foreground" />
          {ASSET_TYPE_LABELS[type]}
        </CardTitle>
        <span className="font-mono text-sm font-medium tabular-nums text-muted-foreground">
          {formatCurrency(total, currency)}
        </span>
      </CardHeader>
      <CardContent>
        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="space-y-1"
        >
          {assets.map((asset) => (
            <AssetRow key={asset.id} asset={asset} currency={currency} />
          ))}
        </motion.ul>
      </CardContent>
    </Card>
  )
}

function AssetRow({ asset, currency }: { asset: Asset; currency: string }) {
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)

  function onDelete() {
    startTransition(async () => {
      const result = await deleteAsset(asset.id)
      if ("error" in result) {
        toast.error(result.error ?? "Não foi possível excluir")
        return
      }
      toast.success("Ativo excluído")
    })
  }

  return (
    <motion.li
      variants={fadeInUp}
      className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/40"
    >
      <div>
        <p className="text-sm font-medium">{asset.name}</p>
        <p className="text-xs text-muted-foreground">Em {formatDate(asset.asOfDate)}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-medium tabular-nums">
          {formatCurrency(asset.valueCents, currency)}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isPending}>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setEditing(true)}>
              <Pencil className="mr-2 size-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 className="mr-2 size-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {editing && <AssetFormDialog asset={asset} open={editing} onOpenChange={setEditing} />}
    </motion.li>
  )
}
