-- CreateEnum
CREATE TYPE "SubscriptionAudience" AS ENUM ('ORGANIZER', 'VOLUNTEER');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "audience" "SubscriptionAudience" NOT NULL DEFAULT 'VOLUNTEER',
ADD COLUMN     "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY';

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "audience" "SubscriptionAudience" NOT NULL DEFAULT 'VOLUNTEER',
ADD COLUMN     "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY';
