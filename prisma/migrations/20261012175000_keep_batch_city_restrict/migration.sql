-- DropForeignKey
ALTER TABLE "Batch" DROP CONSTRAINT "Batch_cityId_fkey";

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
