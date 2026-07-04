-- CreateEnum
CREATE TYPE "BillType" AS ENUM ('ONE_TIME', 'INSTALLMENT', 'RECURRING');

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BillPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'BOLETO', 'CASH', 'BANK_TRANSFER', 'OTHER');

-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM');

-- CreateTable
CREATE TABLE "bills" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "categoryId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "note" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "type" "BillType" NOT NULL DEFAULT 'ONE_TIME',
    "status" "BillStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "BillPriority" NOT NULL DEFAULT 'MEDIUM',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "paymentMethod" "PaymentMethod",
    "paymentAccount" TEXT,
    "installmentGroupId" TEXT,
    "installmentNumber" INTEGER,
    "installmentTotal" INTEGER,
    "recurrenceGroupId" TEXT,
    "recurrenceFrequency" "RecurrenceFrequency",
    "recurrenceRule" TEXT,
    "recurrenceIndex" INTEGER,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bills_transactionId_key" ON "bills"("transactionId");

-- CreateIndex
CREATE INDEX "bills_profileId_dueDate_idx" ON "bills"("profileId", "dueDate");

-- CreateIndex
CREATE INDEX "bills_profileId_status_idx" ON "bills"("profileId", "status");

-- CreateIndex
CREATE INDEX "bills_installmentGroupId_idx" ON "bills"("installmentGroupId");

-- CreateIndex
CREATE INDEX "bills_recurrenceGroupId_idx" ON "bills"("recurrenceGroupId");

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
