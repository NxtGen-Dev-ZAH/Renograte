-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" DOUBLE PRECISION NOT NULL,
    "squareFootage" INTEGER NOT NULL,
    "lotSize" TEXT,
    "yearBuilt" INTEGER,
    "listingPrice" DOUBLE PRECISION NOT NULL,
    "afterRepairValue" DOUBLE PRECISION NOT NULL,
    "renovationCost" DOUBLE PRECISION NOT NULL,
    "termsAvailable" TEXT NOT NULL,
    "additionalTerms" TEXT,
    "photos" TEXT[],
    "videoUrl" TEXT,
    "virtualTourUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "agentId" TEXT NOT NULL,
    "adminFeedback" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
