-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "googleId" TEXT,
    "avatarUrl" TEXT,
    "coverUrl" TEXT,
    "bio" TEXT,
    "institution" TEXT,
    "location" TEXT,
    "website" TEXT,
    "course" TEXT,
    "gradYear" INTEGER,
    "interests" TEXT NOT NULL DEFAULT '[]',
    "twitter" TEXT,
    "github" TEXT,
    "linkedin" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "emailVerified" BOOLEAN NOT NULL DEFAULT true,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "points" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "verifyToken" TEXT,
    "resetToken" TEXT,
    "resetTokenExp" DATETIME
);
INSERT INTO "new_User" ("avatarUrl", "bio", "createdAt", "email", "emailVerified", "googleId", "id", "institution", "isBlocked", "level", "name", "passwordHash", "points", "resetToken", "resetTokenExp", "role", "updatedAt", "username", "verifyToken") SELECT "avatarUrl", "bio", "createdAt", "email", "emailVerified", "googleId", "id", "institution", "isBlocked", "level", "name", "passwordHash", "points", "resetToken", "resetTokenExp", "role", "updatedAt", "username", "verifyToken" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
CREATE UNIQUE INDEX "User_verifyToken_key" ON "User"("verifyToken");
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");
CREATE INDEX "User_points_idx" ON "User"("points");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
