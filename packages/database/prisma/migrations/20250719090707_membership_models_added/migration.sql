-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('TR', 'EN', 'DE', 'FR');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('TRY', 'USD', 'EUR');

-- CreateEnum
CREATE TYPE "MemberShipTier" AS ENUM ('FREE', 'BASIC', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tier" "MemberShipTier" NOT NULL DEFAULT 'FREE';

-- CreateTable
CREATE TABLE "MembershipPlanPrices" (
    "id" TEXT NOT NULL,
    "currency" "Currency" NOT NULL,
    "locale" "Locale" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discountedPrice" DOUBLE PRECISION,
    "membershipId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipPlanPrices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" "MemberShipTier" NOT NULL,
    "features" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "planId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MembershipPlanPrices_currency_locale_membershipId_key" ON "MembershipPlanPrices"("currency", "locale", "membershipId");

-- CreateIndex
CREATE UNIQUE INDEX "MembershipPlan_tier_key" ON "MembershipPlan"("tier");

-- AddForeignKey
ALTER TABLE "MembershipPlanPrices" ADD CONSTRAINT "MembershipPlanPrices_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "MembershipPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "MembershipPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
