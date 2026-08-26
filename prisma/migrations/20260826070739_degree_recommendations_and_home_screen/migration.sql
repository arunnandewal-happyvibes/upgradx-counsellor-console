-- CreateTable
CREATE TABLE "DegreeRecommendation" (
    "id" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "choice1ProgramId" TEXT,
    "choice1Why" TEXT,
    "choice2ProgramId" TEXT,
    "choice2Why" TEXT,
    "choice3ProgramId" TEXT,
    "choice3Why" TEXT,

    CONSTRAINT "DegreeRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeScreenSettings" (
    "id" TEXT NOT NULL,
    "headline" TEXT NOT NULL DEFAULT 'upGrad X can transform your journey',
    "subheadline" TEXT NOT NULL DEFAULT 'Offline, mentor-led programs built with hiring partners — from classroom to career, in one connected track.',
    "primaryCtaLabel" TEXT NOT NULL DEFAULT 'Explore Programs',
    "secondaryCtaLabel" TEXT NOT NULL DEFAULT 'Book Counselling',
    "placementRecordPercent" TEXT NOT NULL DEFAULT '85%',
    "placementRecordCaption" TEXT NOT NULL DEFAULT 'Avg. successful transitions within 6 months',
    "careerGrowthCaption" TEXT NOT NULL DEFAULT 'Tailored pathways for senior roles.',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeScreenSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DegreeRecommendation_degree_key" ON "DegreeRecommendation"("degree");

-- AddForeignKey
ALTER TABLE "DegreeRecommendation" ADD CONSTRAINT "DegreeRecommendation_choice1ProgramId_fkey" FOREIGN KEY ("choice1ProgramId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DegreeRecommendation" ADD CONSTRAINT "DegreeRecommendation_choice2ProgramId_fkey" FOREIGN KEY ("choice2ProgramId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DegreeRecommendation" ADD CONSTRAINT "DegreeRecommendation_choice3ProgramId_fkey" FOREIGN KEY ("choice3ProgramId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;
