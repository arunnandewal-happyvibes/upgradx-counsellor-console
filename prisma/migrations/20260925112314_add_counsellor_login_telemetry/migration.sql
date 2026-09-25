-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "counsellorEmail" TEXT;

-- CreateTable
CREATE TABLE "CounsellorLogin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "loggedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CounsellorLogin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CounsellorLogin_email_idx" ON "CounsellorLogin"("email");
