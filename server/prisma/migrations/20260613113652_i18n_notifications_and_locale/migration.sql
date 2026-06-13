-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "message" TEXT,
    "messageKey" TEXT,
    "messageParams" TEXT,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "actorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Notification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Notification" ("actorId", "createdAt", "id", "link", "message", "read", "type", "userId") SELECT "actorId", "createdAt", "id", "link", "message", "read", "type", "userId" FROM "Notification";
DROP TABLE "Notification";
ALTER TABLE "new_Notification" RENAME TO "Notification";
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");
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
    "locale" TEXT NOT NULL DEFAULT 'en',
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
INSERT INTO "new_User" ("avatarUrl", "bio", "course", "coverUrl", "createdAt", "email", "emailVerified", "github", "googleId", "gradYear", "id", "institution", "interests", "isBlocked", "level", "linkedin", "location", "name", "passwordHash", "points", "resetToken", "resetTokenExp", "role", "twitter", "updatedAt", "username", "verifyToken", "website") SELECT "avatarUrl", "bio", "course", "coverUrl", "createdAt", "email", "emailVerified", "github", "googleId", "gradYear", "id", "institution", "interests", "isBlocked", "level", "linkedin", "location", "name", "passwordHash", "points", "resetToken", "resetTokenExp", "role", "twitter", "updatedAt", "username", "verifyToken", "website" FROM "User";
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
