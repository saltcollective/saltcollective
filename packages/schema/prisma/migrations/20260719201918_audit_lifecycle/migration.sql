-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM ('CLUB', 'USER');

-- CreateEnum
CREATE TYPE "AuditEventType" AS ENUM ('CLUB_CREATED', 'CLUB_PUBLISHED', 'CLUB_SUSPENDED', 'CLUB_REACTIVATED', 'CLUB_DELETED', 'USER_CREATED', 'USER_DEACTIVATED', 'USER_REACTIVATED', 'USER_DELETED', 'USER_TYPE_CHANGED', 'MEMBER_JOINED', 'MEMBER_REMOVED', 'MEMBER_ROLE_CHANGED');

-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "paidUntil" TIMESTAMP(3),
ADD COLUMN     "suspendedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastActiveAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "entityType" "AuditEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "type" "AuditEventType" NOT NULL,
    "actorId" TEXT,
    "actorEmail" TEXT,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditEvent_entityType_entityId_createdAt_idx" ON "AuditEvent"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");
