-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "ticketCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Application_ticketCode_key" ON "Application"("ticketCode");

