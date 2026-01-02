-- AlterTable
ALTER TABLE "Order" ADD COLUMN "completedAt" DATETIME;
ALTER TABLE "Order" ADD COLUMN "shippedAt" DATETIME;
ALTER TABLE "Order" ADD COLUMN "shippingCarrier" TEXT;
ALTER TABLE "Order" ADD COLUMN "shippingTrackingNo" TEXT;
