-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('pending', 'reviewed', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "FeedbackCategory" AS ENUM ('bug', 'feature', 'data', 'other');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('fullTime', 'partTime', 'internship');

-- CreateEnum
CREATE TYPE "PresenceStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "SeniorityLevel" AS ENUM ('junior', 'mid', 'senior', 'lead');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('student', 'graduate', 'admin');

-- CreateTable
CREATE TABLE "academicPublications" (
    "id" SERIAL NOT NULL,
    "subCategoryId" INTEGER NOT NULL,
    "acronym" TEXT,
    "publicationType" TEXT,
    "title" TEXT NOT NULL,
    "issn" CHAR(8),
    "eissn" CHAR(8),
    "openAccessType" TEXT,
    "indexingService" TEXT,
    "specificFocusScope" TEXT,
    "websiteLink" TEXT,
    "journalScope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academicPublications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academicResearchers" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "department" TEXT,
    "affiliation" TEXT,
    "mainTopic" TEXT,
    "subtopics" JSONB,
    "scholarId" TEXT,
    "linkedinUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academicResearchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "size" TEXT,
    "website" TEXT,
    "linkedin" TEXT,
    "glassdoor" TEXT,
    "headquartersCountry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companyBranches" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "region" TEXT,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "presence" "PresenceStatus",

    CONSTRAINT "companyBranches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedbacks" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "category" "FeedbackCategory",
    "message" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graduationProjectApplications" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "applicantUserId" INTEGER NOT NULL,
    "teamMembers" JSONB,
    "proposalSummaryUrl" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'pending',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "graduationProjectApplications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graduationProjects" (
    "id" SERIAL NOT NULL,
    "isSponsored" BOOLEAN NOT NULL,
    "sponsorCompanyId" INTEGER,
    "university" TEXT,
    "faculty" TEXT,
    "industry" TEXT,
    "domains" JSONB,
    "supervisor" TEXT,
    "coSupervisor" TEXT,
    "projectTitle" TEXT NOT NULL,
    "noOfStudents" INTEGER,
    "documentationLink" TEXT,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "graduationProjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobApplications" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "applicantUserId" INTEGER NOT NULL,
    "cvPath" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'pending',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jobApplications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "industry" TEXT,
    "domains" JSONB,
    "type" "JobType",
    "seniority" "SeniorityLevel",
    "description" TEXT,
    "requirements" TEXT,
    "salary" TEXT,
    "applyLink" TEXT,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "userId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" TEXT,
    "country" TEXT,
    "governorate" TEXT,
    "university" TEXT,
    "faculty" TEXT,
    "department" TEXT,
    "graduationYear" INTEGER,
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "scholarUrl" TEXT,
    "skills" JSONB,
    "experience" JSONB,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "publicationDomains" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "publicationDomains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publicationSubcategories" (
    "id" SERIAL NOT NULL,
    "domainId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "publicationSubcategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publicationYearlyMetrics" (
    "id" SERIAL NOT NULL,
    "publicationId" INTEGER NOT NULL,
    "metricYear" INTEGER NOT NULL,
    "journalImpactFactor" DECIMAL(10,4),
    "fiveYearImpactFactor" DECIMAL(10,4),
    "quartile" CHAR(2),
    "jci" DECIMAL(10,4),
    "eigenfactor" DECIMAL(10,6),
    "articleInfluenceScore" DECIMAL(10,4),
    "citescore" DECIMAL(10,4),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "publicationYearlyMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "academicPublications_title_key" ON "academicPublications"("title");

-- CreateIndex
CREATE UNIQUE INDEX "academicPublications_issn_key" ON "academicPublications"("issn");

-- CreateIndex
CREATE UNIQUE INDEX "academicPublications_eissn_key" ON "academicPublications"("eissn");

-- CreateIndex
CREATE UNIQUE INDEX "companies_name_key" ON "companies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "publicationDomains_name_key" ON "publicationDomains"("name");

-- CreateIndex
CREATE UNIQUE INDEX "publicationYearlyMetrics_publicationId_metricYear_key" ON "publicationYearlyMetrics"("publicationId", "metricYear");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "academicPublications" ADD CONSTRAINT "academicPublications_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "publicationSubcategories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companyBranches" ADD CONSTRAINT "companyBranches_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduationProjectApplications" ADD CONSTRAINT "graduationProjectApplications_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "graduationProjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduationProjectApplications" ADD CONSTRAINT "graduationProjectApplications_applicantUserId_fkey" FOREIGN KEY ("applicantUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduationProjects" ADD CONSTRAINT "graduationProjects_sponsorCompanyId_fkey" FOREIGN KEY ("sponsorCompanyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobApplications" ADD CONSTRAINT "jobApplications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobApplications" ADD CONSTRAINT "jobApplications_applicantUserId_fkey" FOREIGN KEY ("applicantUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "companyBranches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publicationSubcategories" ADD CONSTRAINT "publicationSubcategories_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "publicationDomains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publicationYearlyMetrics" ADD CONSTRAINT "publicationYearlyMetrics_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "academicPublications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
