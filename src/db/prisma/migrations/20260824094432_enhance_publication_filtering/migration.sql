/*
  Warnings:

  - The values [Hybrid_Open_Access,Full_Open_Access,Subscriber_Based_Access] on the enum `PublicationAccessType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `websiteLink` on the `academicPublications` table. All the data in the column will be lost.
  - You are about to drop the column `fiveYearImpactFactor` on the `publicationYearlyMetrics` table. All the data in the column will be lost.
  - You are about to drop the column `journalImpactFactor` on the `publicationYearlyMetrics` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[issnCdrom]` on the table `academicPublications` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `publisher` to the `academicPublications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workflow` to the `academicPublications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `articleDownloads` to the `publicationYearlyMetrics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalCitations` to the `publicationYearlyMetrics` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Publisher" AS ENUM ('IEEE', 'APS', 'Royal Society', 'ACS', 'ACM', 'Taylor & Francis', 'Oxford', 'ElSevier', 'Springer', 'Sage', 'MDPI');

-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('CC', 'CC BY', 'CC BY-SA', 'CC BY-NC', 'CC BY-ND', 'CC BY-NC-ND');

-- CreateEnum
CREATE TYPE "SubBucket" AS ENUM ('Core Hybrid Proprietary English', 'Core Hybrid Society English', 'Core Gold', 'Cell Press Gold', 'Cell Press Hybrid Proprietary', 'Cell Press Hybrid Society', 'Core Hybrid Local Language', 'TL Subscription', 'The Lancet Gold');

-- CreateEnum
CREATE TYPE "Workflow" AS ENUM ('standard', 'non-standard');

-- AlterEnum
BEGIN;
CREATE TYPE "PublicationAccessType_new" AS ENUM ('Hybrid', 'Full Open Access', 'Golden Open Access', 'Diamond Open Access', 'Green Open Access', 'Bronze Open Access', 'Subscriber Based Access');
ALTER TABLE "academicPublications" ALTER COLUMN "openAccessType" TYPE "PublicationAccessType_new" USING ("openAccessType"::text::"PublicationAccessType_new");
ALTER TYPE "PublicationAccessType" RENAME TO "PublicationAccessType_old";
ALTER TYPE "PublicationAccessType_new" RENAME TO "PublicationAccessType";
DROP TYPE "public"."PublicationAccessType_old";
COMMIT;

-- DropIndex
DROP INDEX "academicPublications_title_key";

-- DropIndex
DROP INDEX "publicationYearlyMetrics_metricYear_journalImpactFactor_idx";

-- AlterTable
ALTER TABLE "academicPublications" DROP COLUMN "websiteLink",
ADD COLUMN     "URL" VARCHAR(500),
ADD COLUMN     "imprint" TEXT,
ADD COLUMN     "issnCdrom" CHAR(8),
ADD COLUMN     "licenseType" "LicenseType",
ADD COLUMN     "publisher" "Publisher" NOT NULL,
ADD COLUMN     "subBucket" "SubBucket",
ADD COLUMN     "workflow" "Workflow" NOT NULL,
ADD COLUMN     "yearLunched" INTEGER;

-- AlterTable
ALTER TABLE "publicationYearlyMetrics" DROP COLUMN "fiveYearImpactFactor",
DROP COLUMN "journalImpactFactor",
ADD COLUMN     "articleDownloads" INTEGER NOT NULL,
ADD COLUMN     "h5Index" DECIMAL(10,4),
ADD COLUMN     "impactFactor" DECIMAL(10,4),
ADD COLUMN     "impactFactor5yr" DECIMAL(10,4),
ADD COLUMN     "sjr" DECIMAL(10,4),
ADD COLUMN     "totalCitations" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "PublicationEditorialStat" (
    "id" SERIAL NOT NULL,
    "publicationId" INTEGER NOT NULL,
    "submissionToFirstDecision" DECIMAL(10,2),
    "submissionToReviewDecision" DECIMAL(10,2),
    "submissionToAcceptance" DECIMAL(10,2),
    "acceptanceToPublication" DECIMAL(10,2),
    "acceptanceRate" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicationEditorialStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicationPricing" (
    "id" SERIAL NOT NULL,
    "publicationId" INTEGER NOT NULL,
    "pricingYear" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "cost" DECIMAL(10,2) NOT NULL,
    "isSubscription" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicationPricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PublicationEditorialStat_submissionToFirstDecision_idx" ON "PublicationEditorialStat"("submissionToFirstDecision" ASC);

-- CreateIndex
CREATE INDEX "PublicationEditorialStat_submissionToAcceptance_idx" ON "PublicationEditorialStat"("submissionToAcceptance" ASC);

-- CreateIndex
CREATE INDEX "PublicationEditorialStat_acceptanceRate_idx" ON "PublicationEditorialStat"("acceptanceRate" DESC);

-- CreateIndex
CREATE INDEX "PublicationPricing_currency_cost_idx" ON "PublicationPricing"("currency", "cost");

-- CreateIndex
CREATE UNIQUE INDEX "PublicationPricing_publicationId_pricingYear_currency_key" ON "PublicationPricing"("publicationId", "pricingYear", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "academicPublications_issnCdrom_key" ON "academicPublications"("issnCdrom");

-- CreateIndex
CREATE INDEX "academicPublications_openAccessType_idx" ON "academicPublications"("openAccessType");

-- CreateIndex
CREATE INDEX "academicPublications_licenseType_idx" ON "academicPublications"("licenseType");

-- CreateIndex
CREATE INDEX "publicationYearlyMetrics_metricYear_impactFactor_idx" ON "publicationYearlyMetrics"("metricYear", "impactFactor" DESC);

-- CreateIndex
CREATE INDEX "publicationYearlyMetrics_metricYear_quartile_idx" ON "publicationYearlyMetrics"("metricYear", "quartile");

-- CreateIndex
CREATE INDEX "publicationYearlyMetrics_metricYear_sjr_idx" ON "publicationYearlyMetrics"("metricYear", "sjr" DESC);

-- AddForeignKey
ALTER TABLE "PublicationEditorialStat" ADD CONSTRAINT "PublicationEditorialStat_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "academicPublications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicationPricing" ADD CONSTRAINT "PublicationPricing_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "academicPublications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
