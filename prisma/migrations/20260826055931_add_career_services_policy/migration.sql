-- CreateTable
CREATE TABLE "CareerServicesPolicy" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Career Services & Placement Assistance Policy',
    "version" TEXT NOT NULL DEFAULT 'Version 1.0',
    "effectiveDate" TEXT NOT NULL DEFAULT 'Effective Date: [DD/MM/YYYY]',
    "body" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerServicesPolicy_pkey" PRIMARY KEY ("id")
);
