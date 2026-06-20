/*
  Warnings:

  - You are about to drop the column `isActive` on the `Business` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "BusinessStatus" AS ENUM ('LEAD', 'ACTIVE', 'DECLINED', 'ARCHIVED');

-- DropForeignKey
ALTER TABLE "Business" DROP CONSTRAINT "Business_sponsorTierId_fkey";

-- AlterTable
ALTER TABLE "Business" DROP COLUMN "isActive",
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "desiredSpend" DECIMAL(10,2),
ADD COLUMN     "message" TEXT,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "status" "BusinessStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "sponsorTierId" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_sponsorTierId_fkey" FOREIGN KEY ("sponsorTierId") REFERENCES "SponsorTier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
