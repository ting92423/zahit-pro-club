-- AlterTable
ALTER TABLE "Order" ADD COLUMN "customerReportedPaidAt" DATETIME;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "atmAccount" TEXT;
ALTER TABLE "Payment" ADD COLUMN "atmBankCode" TEXT;
ALTER TABLE "Payment" ADD COLUMN "atmExpireAt" DATETIME;
