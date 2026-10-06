-- AlterTable
ALTER TABLE "academicPublications"
ADD COLUMN "search_vector" tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
  setweight(to_tsvector('english', coalesce("journalScope", '')), 'B')
) STORED;

CREATE INDEX idx_journal_search ON "academicPublications" USING GIN("search_vector");
