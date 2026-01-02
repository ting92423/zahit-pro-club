-- CreateTable
CREATE TABLE "MemberOtp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "MemberOtp_email_createdAt_idx" ON "MemberOtp"("email", "createdAt");

-- CreateIndex
CREATE INDEX "MemberOtp_email_code_idx" ON "MemberOtp"("email", "code");
