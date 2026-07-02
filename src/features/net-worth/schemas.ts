import { z } from "zod"

import { moneyAmountSchema } from "@/lib/validations/common"

export const assetSchema = z.object({
  name: z.string().min(1, "Informe um nome"),
  type: z.enum(["CASH", "INVESTMENT", "PROPERTY", "VEHICLE", "DEBT", "OTHER"]),
  value: moneyAmountSchema,
  asOfDate: z.coerce.date(),
})

export type AssetInput = z.infer<typeof assetSchema>
