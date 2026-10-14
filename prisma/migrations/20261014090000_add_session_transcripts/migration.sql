-- CreateTable
CREATE TABLE "SessionRecording" (
    "id" TEXT NOT NULL,
    "sessionKey" TEXT NOT NULL,
    "counsellorEmail" TEXT,
    "consentConfirmedAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "leadId" TEXT,

    CONSTRAINT "SessionRecording_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranscriptChunk" (
    "id" TEXT NOT NULL,
    "recordingId" TEXT NOT NULL,
    "seq" INTEGER NOT NULL,
    "offsetSec" DOUBLE PRECISION NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TranscriptChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SessionRecording_sessionKey_key" ON "SessionRecording"("sessionKey");

-- CreateIndex
CREATE UNIQUE INDEX "SessionRecording_leadId_key" ON "SessionRecording"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "TranscriptChunk_recordingId_seq_key" ON "TranscriptChunk"("recordingId", "seq");

-- AddForeignKey
ALTER TABLE "SessionRecording" ADD CONSTRAINT "SessionRecording_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranscriptChunk" ADD CONSTRAINT "TranscriptChunk_recordingId_fkey" FOREIGN KEY ("recordingId") REFERENCES "SessionRecording"("id") ON DELETE CASCADE ON UPDATE CASCADE;

