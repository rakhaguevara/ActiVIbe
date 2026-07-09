-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "picContact" TEXT,
ADD COLUMN     "picName" TEXT,
ADD COLUMN     "registrationClosedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "EventCloseReport" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "narrativeSummary" TEXT NOT NULL,
    "volunteersPresentCount" INTEGER NOT NULL,
    "totalContributionHours" DOUBLE PRECISION NOT NULL,
    "photoUrls" TEXT[],
    "constraintsNotes" TEXT,
    "impactSummary" TEXT,
    "categoryMetrics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventCloseReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventCloseReport_eventId_key" ON "EventCloseReport"("eventId");

-- AddForeignKey
ALTER TABLE "EventCloseReport" ADD CONSTRAINT "EventCloseReport_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

