-- CreateTable
CREATE TABLE "ContractSigningToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractSigningToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContractSigningToken_token_key" ON "ContractSigningToken"("token");

-- CreateIndex
CREATE INDEX "ContractSigningToken_contractId_idx" ON "ContractSigningToken"("contractId");

-- CreateIndex
CREATE INDEX "ContractSigningToken_token_idx" ON "ContractSigningToken"("token");

-- AddForeignKey
ALTER TABLE "ContractSigningToken" ADD CONSTRAINT "ContractSigningToken_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
