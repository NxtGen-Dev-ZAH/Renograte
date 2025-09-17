-- AlterTable
ALTER TABLE "MemberProfile" ADD COLUMN     "isEarlyAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT,
ADD COLUMN     "trialEndsAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "EarlyAccessQuota" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "currentCount" INTEGER NOT NULL DEFAULT 0,
    "maxCount" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EarlyAccessQuota_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EarlyAccessQuota_role_idx" ON "EarlyAccessQuota"("role");

-- CreateIndex
CREATE UNIQUE INDEX "EarlyAccessQuota_role_key" ON "EarlyAccessQuota"("role");

-- CreateIndex
CREATE INDEX "MemberProfile_isEarlyAccess_idx" ON "MemberProfile"("isEarlyAccess");

-- CreateIndex
CREATE INDEX "MemberProfile_status_idx" ON "MemberProfile"("status");
