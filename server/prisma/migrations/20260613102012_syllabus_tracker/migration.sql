-- CreateTable
CREATE TABLE "Syllabus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "className" TEXT,
    "board" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "fileUrl" TEXT,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "subjectId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Syllabus_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Syllabus_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SyllabusTopic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "syllabusId" TEXT NOT NULL,
    CONSTRAINT "SyllabusTopic_syllabusId_fkey" FOREIGN KEY ("syllabusId") REFERENCES "Syllabus" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SyllabusTrack" (
    "userId" TEXT NOT NULL,
    "syllabusId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "syllabusId"),
    CONSTRAINT "SyllabusTrack_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SyllabusTrack_syllabusId_fkey" FOREIGN KEY ("syllabusId") REFERENCES "Syllabus" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SyllabusProgress" (
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "topicId"),
    CONSTRAINT "SyllabusProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SyllabusProgress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "SyllabusTopic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Syllabus_subjectId_idx" ON "Syllabus"("subjectId");

-- CreateIndex
CREATE INDEX "Syllabus_status_idx" ON "Syllabus"("status");

-- CreateIndex
CREATE INDEX "Syllabus_createdAt_idx" ON "Syllabus"("createdAt");

-- CreateIndex
CREATE INDEX "SyllabusTopic_syllabusId_idx" ON "SyllabusTopic"("syllabusId");

-- CreateIndex
CREATE INDEX "SyllabusTrack_syllabusId_idx" ON "SyllabusTrack"("syllabusId");

-- CreateIndex
CREATE INDEX "SyllabusProgress_topicId_idx" ON "SyllabusProgress"("topicId");
