-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "propertyAddress" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "listingPrice" TEXT NOT NULL,
    "offerAmount" TEXT NOT NULL,
    "earnestMoney" TEXT NOT NULL,
    "closingDate" TEXT NOT NULL,
    "financing" TEXT,
    "downPayment" TEXT,
    "loanAmount" TEXT,
    "inspectionPeriod" TEXT,
    "contingencies" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminFeedback" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Offer_userId_idx" ON "Offer"("userId");

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
