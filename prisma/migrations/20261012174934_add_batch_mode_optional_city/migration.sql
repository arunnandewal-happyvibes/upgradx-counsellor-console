-- DropForeignKey
ALTER TABLE "Batch" DROP CONSTRAINT "Batch_cityId_fkey";

-- AlterTable
ALTER TABLE "Batch" ADD COLUMN     "mode" TEXT NOT NULL DEFAULT 'Offline',
ALTER COLUMN "cityId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;
