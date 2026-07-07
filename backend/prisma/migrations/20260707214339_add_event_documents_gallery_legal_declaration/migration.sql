-- CreateEnum
CREATE TYPE "EventMode" AS ENUM ('ONLINE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "OrganizationEntityType" AS ENUM ('INDIVIDU', 'PT', 'CV', 'YAYASAN', 'ORGANISASI');

-- CreateEnum
CREATE TYPE "LegalDocType" AS ENUM ('NIB', 'AKTA', 'SK_KEMENKUMHAM', 'NPWP');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "assignmentLetterFileName" TEXT,
ADD COLUMN     "assignmentLetterUrl" TEXT,
ADD COLUMN     "cooperationLetterFileName" TEXT,
ADD COLUMN     "cooperationLetterUrl" TEXT,
ADD COLUMN     "declarationAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "declarationChecklist" JSONB,
ADD COLUMN     "eventMode" "EventMode" NOT NULL DEFAULT 'OFFLINE',
ADD COLUMN     "locationPermitFileName" TEXT,
ADD COLUMN     "locationPermitUrl" TEXT,
ADD COLUMN     "mapLink" TEXT,
ADD COLUMN     "onBehalfOfInstitution" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "organizationEntityType" "OrganizationEntityType" NOT NULL DEFAULT 'INDIVIDU',
ADD COLUMN     "posterImageFileName" TEXT,
ADD COLUMN     "posterImageUrl" TEXT,
ADD COLUMN     "proposalDocFileName" TEXT,
ADD COLUMN     "proposalDocUrl" TEXT,
ADD COLUMN     "responsibilityLetterFileName" TEXT,
ADD COLUMN     "responsibilityLetterUrl" TEXT,
ADD COLUMN     "rundownDocFileName" TEXT,
ADD COLUMN     "rundownDocUrl" TEXT;

-- CreateTable
CREATE TABLE "EventGalleryImage" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventGalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventLegalDocument" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "docType" "LegalDocType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventLegalDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventGalleryImage_eventId_idx" ON "EventGalleryImage"("eventId");

-- CreateIndex
CREATE INDEX "EventLegalDocument_eventId_idx" ON "EventLegalDocument"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "EventLegalDocument_eventId_docType_key" ON "EventLegalDocument"("eventId", "docType");

-- AddForeignKey
ALTER TABLE "EventGalleryImage" ADD CONSTRAINT "EventGalleryImage_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventLegalDocument" ADD CONSTRAINT "EventLegalDocument_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

