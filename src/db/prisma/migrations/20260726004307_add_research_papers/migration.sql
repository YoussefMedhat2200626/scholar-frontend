-- CreateTable
CREATE TABLE "researchPapers" (
    "id" SERIAL NOT NULL,
    "putCode" BIGINT,
    "orcidPath" TEXT,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "type" TEXT,
    "journalTitle" TEXT,
    "doi" TEXT,
    "url" TEXT,
    "publicationYear" INTEGER,
    "publicationMonth" INTEGER,
    "publicationDay" INTEGER,
    "sourceName" TEXT,
    "visibility" TEXT DEFAULT 'public',
    "staffId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "researchPapers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "researchPapers_staffId_idx" ON "researchPapers"("staffId");

-- CreateIndex
CREATE INDEX "researchPapers_doi_idx" ON "researchPapers"("doi");

-- CreateIndex
CREATE INDEX "researchPapers_putCode_idx" ON "researchPapers"("putCode");

-- AddForeignKey
ALTER TABLE "researchPapers" ADD CONSTRAINT "researchPapers_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "universityStaff"("id") ON DELETE CASCADE ON UPDATE CASCADE;
