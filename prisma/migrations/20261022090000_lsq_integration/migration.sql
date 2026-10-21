-- LeadSquared (v6 drop-lead) integration — see LSQ_INTEGRATION.md.

-- Counsellors allowed to run sessions; email = their LSQ login.
CREATE TABLE "Counsellor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "centre" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Counsellor_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Counsellor_email_key" ON "Counsellor"("email");

-- LSQ codes per program.
ALTER TABLE "Program" ADD COLUMN "lsqVertical" TEXT;
ALTER TABLE "Program" ADD COLUMN "lsqProgramme" TEXT;

-- Trace of what was sent to LSQ for each closed session.
ALTER TABLE "Lead" ADD COLUMN "lsqLeadId" TEXT;
ALTER TABLE "Lead" ADD COLUMN "lsqCampaign" TEXT;
ALTER TABLE "Lead" ADD COLUMN "lsqOwnerEmail" TEXT;
ALTER TABLE "Lead" ADD COLUMN "lsqSource" TEXT;
ALTER TABLE "Lead" ADD COLUMN "lsqCentre" TEXT;

-- Fill the codes for the current programs (doc §3 table). Program names differ between
-- environments, so match by keyword; most specific rules first, each only fills a program
-- that has no code yet. Anything left unmatched is flagged on the admin dashboard.
UPDATE "Program" SET "lsqVertical" = 'Finance', "lsqProgramme" = 'IBOps'
  WHERE "lsqProgramme" IS NULL AND ("name" ILIKE '%banking%' OR "name" ILIKE '%finance%');
UPDATE "Program" SET "lsqVertical" = 'Tech', "lsqProgramme" = 'FSD'
  WHERE "lsqProgramme" IS NULL AND "name" ILIKE '%full stack%';
UPDATE "Program" SET "lsqVertical" = 'Tech', "lsqProgramme" = 'DM'
  WHERE "lsqProgramme" IS NULL AND "name" ILIKE '%digital marketing%';
UPDATE "Program" SET "lsqVertical" = 'Tech', "lsqProgramme" = 'AI'
  WHERE "lsqProgramme" IS NULL AND ("name" ILIKE '%ai pro%' OR "name" ILIKE '%agentic%');
UPDATE "Program" SET "lsqVertical" = 'Tech', "lsqProgramme" = 'DA'
  WHERE "lsqProgramme" IS NULL AND "name" ILIKE '%analytics%' AND "name" NOT ILIKE '%data science%';
UPDATE "Program" SET "lsqVertical" = 'Tech', "lsqProgramme" = 'DS'
  WHERE "lsqProgramme" IS NULL AND "name" ILIKE '%data science%';
