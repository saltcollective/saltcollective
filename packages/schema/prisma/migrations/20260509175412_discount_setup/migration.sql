-- CreateTable
CREATE TABLE "DiscountCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "redeemedByClubId" TEXT,
    "redeemedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCode_code_key" ON "DiscountCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCode_redeemedByClubId_key" ON "DiscountCode"("redeemedByClubId");

-- AddForeignKey
ALTER TABLE "DiscountCode" ADD CONSTRAINT "DiscountCode_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountCode" ADD CONSTRAINT "DiscountCode_redeemedByClubId_fkey" FOREIGN KEY ("redeemedByClubId") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;
