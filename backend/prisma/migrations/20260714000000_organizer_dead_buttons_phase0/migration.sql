-- CreateEnum
CREATE TYPE "ScheduledMessageStatus" AS ENUM ('SCHEDULED', 'SENT', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "OrganizationMemberRole" AS ENUM ('OWNER', 'ADMINISTRATOR', 'COORDINATOR');

-- CreateEnum
CREATE TYPE "OrganizationMemberStatus" AS ENUM ('INVITED', 'ACTIVE');

-- AlterEnum
ALTER TYPE "OrganizationStatus" ADD VALUE 'DEACTIVATED';

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "emailFooterText" TEXT,
ADD COLUMN     "emailHeaderImageUrl" TEXT,
ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "primaryColor" TEXT,
ADD COLUMN     "secondaryColor" TEXT,
ADD COLUMN     "signatureUrl" TEXT,
ADD COLUMN     "stampUrl" TEXT;

-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "lastUsedAt" TIMESTAMP(3),
ADD COLUMN     "userAgent" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "twoFactorEnabledAt" TIMESTAMP(3),
ADD COLUMN     "twoFactorSecret" TEXT;

-- CreateTable
CREATE TABLE "MessageTemplate" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledMessage" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "targetSegment" TEXT NOT NULL,
    "sendAt" TIMESTAMP(3) NOT NULL,
    "status" "ScheduledMessageStatus" NOT NULL DEFAULT 'SCHEDULED',
    "sentCommunicationLogId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "OrganizationMemberRole" NOT NULL DEFAULT 'COORDINATOR',
    "status" "OrganizationMemberStatus" NOT NULL DEFAULT 'INVITED',
    "inviteTokenHash" TEXT,
    "inviteTokenExpiresAt" TIMESTAMP(3),
    "invitedById" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationSettings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'id',
    "country" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    "timeFormat" TEXT NOT NULL DEFAULT '24h',
    "weekStart" TEXT NOT NULL DEFAULT 'MONDAY',
    "units" TEXT,
    "defaultEventDurationHours" INTEGER,
    "notifyEmailNewApplicant" BOOLEAN NOT NULL DEFAULT true,
    "notifyEmailEventReminder" BOOLEAN NOT NULL DEFAULT true,
    "notifyEmailBroadcastReceipts" BOOLEAN NOT NULL DEFAULT false,
    "notifyEmailWeeklyDigest" BOOLEAN NOT NULL DEFAULT false,
    "notificationFrequency" TEXT NOT NULL DEFAULT 'INSTANT',
    "webhookUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MessageTemplate_organizationId_idx" ON "MessageTemplate"("organizationId");

-- CreateIndex
CREATE INDEX "ScheduledMessage_organizationId_idx" ON "ScheduledMessage"("organizationId");

-- CreateIndex
CREATE INDEX "ScheduledMessage_status_sendAt_idx" ON "ScheduledMessage"("status", "sendAt");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_inviteTokenHash_key" ON "OrganizationMember"("inviteTokenHash");

-- CreateIndex
CREATE INDEX "OrganizationMember_organizationId_idx" ON "OrganizationMember"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organizationId_email_key" ON "OrganizationMember"("organizationId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationSettings_organizationId_key" ON "OrganizationSettings"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_organizationId_idx" ON "ApiKey"("organizationId");

-- AddForeignKey
ALTER TABLE "MessageTemplate" ADD CONSTRAINT "MessageTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageTemplate" ADD CONSTRAINT "MessageTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledMessage" ADD CONSTRAINT "ScheduledMessage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledMessage" ADD CONSTRAINT "ScheduledMessage_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledMessage" ADD CONSTRAINT "ScheduledMessage_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationSettings" ADD CONSTRAINT "OrganizationSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

