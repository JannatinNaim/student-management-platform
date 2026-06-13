-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "chapter" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileHash" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "className" TEXT,
    "board" TEXT,
    "college" TEXT,
    "teacherName" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "downloadsCount" INTEGER NOT NULL DEFAULT 0,
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "avgRating" REAL NOT NULL DEFAULT 0,
    "ratingsCount" INTEGER NOT NULL DEFAULT 0,
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Note_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Note_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Note" ("authorId", "avgRating", "board", "chapter", "className", "college", "commentsCount", "createdAt", "description", "downloadsCount", "fileHash", "fileSize", "fileType", "fileUrl", "id", "likesCount", "ratingsCount", "status", "subjectId", "tags", "teacherName", "thumbnailUrl", "title", "type", "updatedAt", "views") SELECT "authorId", "avgRating", "board", "chapter", "className", "college", "commentsCount", "createdAt", "description", "downloadsCount", "fileHash", "fileSize", "fileType", "fileUrl", "id", "likesCount", "ratingsCount", "status", "subjectId", "tags", "teacherName", "thumbnailUrl", "title", "type", "updatedAt", "views" FROM "Note";
DROP TABLE "Note";
ALTER TABLE "new_Note" RENAME TO "Note";
CREATE INDEX "Note_subjectId_idx" ON "Note"("subjectId");
CREATE INDEX "Note_authorId_idx" ON "Note"("authorId");
CREATE INDEX "Note_createdAt_idx" ON "Note"("createdAt");
CREATE INDEX "Note_isOfficial_idx" ON "Note"("isOfficial");
CREATE INDEX "Note_downloadsCount_idx" ON "Note"("downloadsCount");
CREATE INDEX "Note_avgRating_idx" ON "Note"("avgRating");
CREATE INDEX "Note_authorId_fileHash_idx" ON "Note"("authorId", "fileHash");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
