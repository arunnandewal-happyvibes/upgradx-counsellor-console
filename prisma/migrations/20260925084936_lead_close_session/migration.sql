-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "recommendedProgramId" TEXT,
ADD COLUMN     "sessionClosedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_recommendedProgramId_fkey" FOREIGN KEY ("recommendedProgramId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;
