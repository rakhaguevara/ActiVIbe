-- CreateEnum
CREATE TYPE "Availability" AS ENUM ('WEEKDAY', 'WEEKEND', 'BOTH');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "availability" "Availability";
