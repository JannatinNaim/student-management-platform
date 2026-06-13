-- CreateTable
CREATE TABLE "Todo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "details" TEXT,
    "category" TEXT NOT NULL DEFAULT 'SCRATCH',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "done" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" DATETIME,
    "position" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "noteId" TEXT,
    "problemId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Todo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Todo_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Todo_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Todo_userId_done_idx" ON "Todo"("userId", "done");

-- CreateIndex
CREATE INDEX "Todo_userId_category_idx" ON "Todo"("userId", "category");

-- CreateIndex
CREATE INDEX "Todo_noteId_idx" ON "Todo"("noteId");

-- CreateIndex
CREATE INDEX "Todo_problemId_idx" ON "Todo"("problemId");
