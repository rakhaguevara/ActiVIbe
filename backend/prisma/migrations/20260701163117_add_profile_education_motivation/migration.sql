-- CreateEnum
CREATE TYPE "Motivation" AS ENUM ('CAREER', 'SOCIAL', 'VALUES', 'SKILL_GROWTH');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "education" TEXT,
ADD COLUMN     "motivation" "Motivation";
