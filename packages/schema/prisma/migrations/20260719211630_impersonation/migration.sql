/*
  Warnings:

  - You are about to drop the column `impersonatedId` on the `ImpersonationLog` table. All the data in the column will be lost.
  - Added the required column `clubId` to the `ImpersonationLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clubName` to the `ImpersonationLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditEventType" ADD VALUE 'CLUB_IMPERSONATION_STARTED';
ALTER TYPE "AuditEventType" ADD VALUE 'CLUB_IMPERSONATION_ENDED';

-- DropForeignKey
ALTER TABLE "ImpersonationLog" DROP CONSTRAINT "ImpersonationLog_impersonatedId_fkey";

-- AlterTable
ALTER TABLE "ImpersonationLog" DROP COLUMN "impersonatedId",
ADD COLUMN     "clubId" TEXT NOT NULL,
ADD COLUMN     "clubName" TEXT NOT NULL;
