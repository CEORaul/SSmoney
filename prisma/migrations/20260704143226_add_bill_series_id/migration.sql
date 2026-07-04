-- AlterTable
ALTER TABLE "bills" ADD COLUMN     "seriesId" TEXT;

-- CreateIndex
CREATE INDEX "bills_profileId_seriesId_idx" ON "bills"("profileId", "seriesId");

-- Backfill: seriesId mirrors whichever group-id already identifies the series
-- (installment or recurring) so existing bills keep working with the new
-- type-agnostic scope-resolution logic without any data loss.
UPDATE "bills"
SET "seriesId" = COALESCE("installmentGroupId", "recurrenceGroupId")
WHERE "installmentGroupId" IS NOT NULL OR "recurrenceGroupId" IS NOT NULL;
