-- CreateTable
CREATE TABLE "AddOnCertificate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AddOnCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AddOnCertificateToProgram" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AddOnCertificateToProgram_AB_unique" ON "_AddOnCertificateToProgram"("A", "B");

-- CreateIndex
CREATE INDEX "_AddOnCertificateToProgram_B_index" ON "_AddOnCertificateToProgram"("B");

-- AddForeignKey
ALTER TABLE "_AddOnCertificateToProgram" ADD CONSTRAINT "_AddOnCertificateToProgram_A_fkey" FOREIGN KEY ("A") REFERENCES "AddOnCertificate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AddOnCertificateToProgram" ADD CONSTRAINT "_AddOnCertificateToProgram_B_fkey" FOREIGN KEY ("B") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
