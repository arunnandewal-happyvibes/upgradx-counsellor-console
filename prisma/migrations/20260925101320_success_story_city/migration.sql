-- AlterTable
ALTER TABLE "SuccessStory" ADD COLUMN     "cityId" TEXT;

-- AddForeignKey
ALTER TABLE "SuccessStory" ADD CONSTRAINT "SuccessStory_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;
