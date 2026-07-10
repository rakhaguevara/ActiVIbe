-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "closedBeforeSchedule" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "participationRatePercentAtClose" INTEGER;

-- CreateTable
CREATE TABLE "OrganizerWarning" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "participationRatePercent" INTEGER NOT NULL,
    "acknowledgedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizerWarning_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrganizerWarning_eventId_idx" ON "OrganizerWarning"("eventId");

-- CreateIndex
CREATE INDEX "OrganizerWarning_organizerId_idx" ON "OrganizerWarning"("organizerId");

-- AddForeignKey
ALTER TABLE "OrganizerWarning" ADD CONSTRAINT "OrganizerWarning_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizerWarning" ADD CONSTRAINT "OrganizerWarning_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizerWarning" ADD CONSTRAINT "OrganizerWarning_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
