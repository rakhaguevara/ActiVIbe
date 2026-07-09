-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "picEmail" TEXT,
ADD COLUMN     "picSubOrganizerId" TEXT;

-- CreateTable
CREATE TABLE "SubOrganizer" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubOrganizer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubOrganizer_organizationId_idx" ON "SubOrganizer"("organizationId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_picSubOrganizerId_fkey" FOREIGN KEY ("picSubOrganizerId") REFERENCES "SubOrganizer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubOrganizer" ADD CONSTRAINT "SubOrganizer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
