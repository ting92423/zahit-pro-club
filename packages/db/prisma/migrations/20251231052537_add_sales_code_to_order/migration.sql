/*
  Warnings:

  - You are about to drop the column `attributionSessionId` on the `Order` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "memberId" TEXT,
    "subtotalAmount" INTEGER NOT NULL,
    "discountAmount" INTEGER NOT NULL DEFAULT 0,
    "pointsRedeemed" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" INTEGER NOT NULL,
    "shippingName" TEXT NOT NULL,
    "shippingPhone" TEXT NOT NULL,
    "shippingEmail" TEXT NOT NULL,
    "shippingAddress" TEXT NOT NULL,
    "shippingCarrier" TEXT,
    "shippingTrackingNo" TEXT,
    "shippedAt" DATETIME,
    "completedAt" DATETIME,
    "customerReportedPaidAt" DATETIME,
    "salesCode" TEXT,
    "claimedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("claimedAt", "completedAt", "createdAt", "customerReportedPaidAt", "discountAmount", "id", "memberId", "orderNumber", "pointsRedeemed", "shippedAt", "shippingAddress", "shippingCarrier", "shippingEmail", "shippingName", "shippingPhone", "shippingTrackingNo", "status", "subtotalAmount", "totalAmount", "updatedAt") SELECT "claimedAt", "completedAt", "createdAt", "customerReportedPaidAt", "discountAmount", "id", "memberId", "orderNumber", "pointsRedeemed", "shippedAt", "shippingAddress", "shippingCarrier", "shippingEmail", "shippingName", "shippingPhone", "shippingTrackingNo", "status", "subtotalAmount", "totalAmount", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE INDEX "Order_memberId_createdAt_idx" ON "Order"("memberId", "createdAt");
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");
CREATE INDEX "Order_shippingEmail_createdAt_idx" ON "Order"("shippingEmail", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
