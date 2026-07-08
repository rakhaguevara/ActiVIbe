-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE');

-- DropIndex
DROP INDEX "Organization_ownerId_key";

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "activationTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "activationTokenHash" TEXT,
ADD COLUMN     "status" "OrganizationStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION';

-- CreateIndex
CREATE UNIQUE INDEX "Organization_activationTokenHash_key" ON "Organization"("activationTokenHash");
