-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "feedbackToken" TEXT,
ADD COLUMN     "ratedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_feedbackToken_key" ON "Lead"("feedbackToken");

