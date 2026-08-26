-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_cityId_fkey";

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "cgpa" TEXT,
ADD COLUMN     "graduation" TEXT,
ADD COLUMN     "graduationCategory" TEXT,
ADD COLUMN     "skills" TEXT[],
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "qualification" DROP NOT NULL,
ALTER COLUMN "cityId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;
