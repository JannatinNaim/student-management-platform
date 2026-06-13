-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProblemMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL DEFAULT '',
    "isSolution" BOOLEAN NOT NULL DEFAULT false,
    "attachmentUrl" TEXT,
    "attachmentName" TEXT,
    "attachmentType" TEXT,
    "attachmentSize" INTEGER,
    "problemId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProblemMessage_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProblemMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProblemMessage" ("authorId", "content", "createdAt", "id", "isSolution", "problemId", "updatedAt") SELECT "authorId", "content", "createdAt", "id", "isSolution", "problemId", "updatedAt" FROM "ProblemMessage";
DROP TABLE "ProblemMessage";
ALTER TABLE "new_ProblemMessage" RENAME TO "ProblemMessage";
CREATE INDEX "ProblemMessage_problemId_idx" ON "ProblemMessage"("problemId");
CREATE INDEX "ProblemMessage_createdAt_idx" ON "ProblemMessage"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
