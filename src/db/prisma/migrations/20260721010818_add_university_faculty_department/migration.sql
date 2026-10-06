/*
  Warnings:

  - You are about to drop the column `indexingService` on the `academicPublications` table. All the data in the column will be lost.
  - You are about to alter the column `acronym` on the `academicPublications` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `specificFocusScope` on the `academicPublications` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `websiteLink` on the `academicPublications` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `name` on the `publicationDomains` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `name` on the `publicationSubcategories` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - The `quartile` column on the `publicationYearlyMetrics` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[publicationId,metricYear,indexingService]` on the table `publicationYearlyMetrics` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `academicPublications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicationType` to the `academicPublications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `openAccessType` to the `academicPublications` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PublicationAccessType" AS ENUM ('Hybrid_Open_Access', 'Full_Open_Access', 'Subscriber_Based_Access');

-- CreateEnum
CREATE TYPE "PublicationIndex" AS ENUM ('SCIE', 'ESCI', 'SSCI');

-- CreateEnum
CREATE TYPE "PublicationType" AS ENUM ('Transaction', 'Magazine', 'Journal', 'Letter');

-- CreateEnum
CREATE TYPE "Quartile" AS ENUM ('Q1', 'Q2', 'Q3', 'Q4');

-- CreateEnum
CREATE TYPE "TeamCategory" AS ENUM ('web', 'industry', 'academia');

-- DropIndex
DROP INDEX "publicationYearlyMetrics_publicationId_metricYear_key";

-- AlterTable
ALTER TABLE "academicPublications" DROP COLUMN "indexingService",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "acronym" SET DATA TYPE VARCHAR(100),
DROP COLUMN "publicationType",
ADD COLUMN     "publicationType" "PublicationType" NOT NULL,
DROP COLUMN "openAccessType",
ADD COLUMN     "openAccessType" "PublicationAccessType" NOT NULL,
ALTER COLUMN "specificFocusScope" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "websiteLink" SET DATA TYPE VARCHAR(500);

-- AlterTable
ALTER TABLE "publicationDomains" ALTER COLUMN "name" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "publicationSubcategories" ALTER COLUMN "name" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "publicationYearlyMetrics" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "indexingService" "PublicationIndex",
DROP COLUMN "quartile",
ADD COLUMN     "quartile" "Quartile";

-- CreateTable
CREATE TABLE "departments" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "website" TEXT,
    "description" TEXT,
    "facultyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculties" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "website" TEXT,
    "description" TEXT,
    "universityId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faculties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "linkedin_url" TEXT,
    "team" "TeamCategory" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universities" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "website" TEXT,
    "country" TEXT,
    "city" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universityStaff" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "alternativeEmail" TEXT,
    "mobile" TEXT,
    "title" TEXT,
    "degree" TEXT,
    "facultyId" INTEGER,
    "departmentId" INTEGER,
    "universityId" INTEGER NOT NULL,
    "universityProfileLink" TEXT,
    "cvLink" TEXT,
    "researchGateLink" TEXT,
    "googleScholarLink" TEXT,
    "academiaLink" TEXT,
    "linkedInLink" TEXT,
    "youtubeLink" TEXT,
    "orcidLink" TEXT,
    "scopusLink" TEXT,
    "titleProfile" TEXT,
    "facultyProfile" TEXT,
    "citations" INTEGER,
    "researchInterests" TEXT[],
    "bio" TEXT,
    "otherUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "universityStaff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "departments_facultyId_idx" ON "departments"("facultyId");

-- CreateIndex
CREATE INDEX "departments_name_idx" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_facultyId_key" ON "departments"("name", "facultyId");

-- CreateIndex
CREATE INDEX "faculties_universityId_idx" ON "faculties"("universityId");

-- CreateIndex
CREATE INDEX "faculties_name_idx" ON "faculties"("name");

-- CreateIndex
CREATE UNIQUE INDEX "faculties_name_universityId_key" ON "faculties"("name", "universityId");

-- CreateIndex
CREATE UNIQUE INDEX "universities_name_key" ON "universities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "universities_shortName_key" ON "universities"("shortName");

-- CreateIndex
CREATE INDEX "universities_name_idx" ON "universities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "universityStaff_email_key" ON "universityStaff"("email");

-- CreateIndex
CREATE INDEX "universityStaff_name_idx" ON "universityStaff"("name");

-- CreateIndex
CREATE INDEX "universityStaff_universityId_idx" ON "universityStaff"("universityId");

-- CreateIndex
CREATE INDEX "universityStaff_facultyId_idx" ON "universityStaff"("facultyId");

-- CreateIndex
CREATE INDEX "universityStaff_departmentId_idx" ON "universityStaff"("departmentId");

-- CreateIndex
CREATE INDEX "academicPublications_subCategoryId_idx" ON "academicPublications"("subCategoryId");

-- CreateIndex
CREATE INDEX "academicPublications_title_idx" ON "academicPublications"("title");

-- CreateIndex
CREATE INDEX "academicPublications_acronym_idx" ON "academicPublications"("acronym");

-- CreateIndex
CREATE INDEX "academicPublications_specificFocusScope_idx" ON "academicPublications"("specificFocusScope");

-- CreateIndex
CREATE INDEX "publicationSubcategories_domainId_idx" ON "publicationSubcategories"("domainId");

-- CreateIndex
CREATE INDEX "publicationYearlyMetrics_metricYear_citescore_idx" ON "publicationYearlyMetrics"("metricYear", "citescore" DESC);

-- CreateIndex
CREATE INDEX "publicationYearlyMetrics_metricYear_journalImpactFactor_idx" ON "publicationYearlyMetrics"("metricYear", "journalImpactFactor" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "publicationYearlyMetrics_publicationId_metricYear_indexingS_key" ON "publicationYearlyMetrics"("publicationId", "metricYear", "indexingService");

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculties" ADD CONSTRAINT "faculties_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universityStaff" ADD CONSTRAINT "universityStaff_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universityStaff" ADD CONSTRAINT "universityStaff_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universityStaff" ADD CONSTRAINT "universityStaff_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
