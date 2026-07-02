import { Car, CreditCard, Home, Package, TrendingUp, Wallet, type LucideIcon } from "lucide-react"

import type { AssetType } from "@/generated/prisma/client"

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  CASH: "Dinheiro",
  INVESTMENT: "Investimentos",
  PROPERTY: "Imóveis",
  VEHICLE: "Veículos",
  DEBT: "Dívidas",
  OTHER: "Outros",
}

export const ASSET_TYPE_ICONS: Record<AssetType, LucideIcon> = {
  CASH: Wallet,
  INVESTMENT: TrendingUp,
  PROPERTY: Home,
  VEHICLE: Car,
  DEBT: CreditCard,
  OTHER: Package,
}

export const ASSET_TYPES_ORDER: AssetType[] = [
  "CASH",
  "INVESTMENT",
  "PROPERTY",
  "VEHICLE",
  "OTHER",
  "DEBT",
]
