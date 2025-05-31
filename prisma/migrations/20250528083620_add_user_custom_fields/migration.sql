-- CreateTable
CREATE TABLE "UserCustomFields" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "website" TEXT,
    "agencyName" TEXT,
    "title" TEXT,
    "license" TEXT,
    "whatsapp" TEXT,
    "taxNumber" TEXT,
    "faxNumber" TEXT,
    "languages" TEXT[],
    "serviceAreas" TEXT[],
    "specialties" TEXT[],
    "aboutAgency" TEXT,
    "facebookUsername" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCustomFields_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserCustomFields_userId_key" ON "UserCustomFields"("userId");

-- CreateIndex
CREATE INDEX "UserCustomFields_userId_idx" ON "UserCustomFields"("userId");

-- AddForeignKey
ALTER TABLE "UserCustomFields" ADD CONSTRAINT "UserCustomFields_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
