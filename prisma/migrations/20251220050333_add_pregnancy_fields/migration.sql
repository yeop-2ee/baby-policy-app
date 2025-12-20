-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "city" TEXT,
    "district" TEXT,
    "neighborhood" TEXT,
    "incomeLevel" TEXT,
    "childCount" INTEGER NOT NULL DEFAULT 0,
    "dualIncome" BOOLEAN NOT NULL DEFAULT false,
    "multiChild" BOOLEAN NOT NULL DEFAULT false,
    "hasChildren" BOOLEAN NOT NULL DEFAULT false,
    "isPregnant" BOOLEAN NOT NULL DEFAULT false,
    "pregnancyWeek" INTEGER,
    "planningPregnancy" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserProfile" ("childCount", "city", "createdAt", "district", "dualIncome", "id", "incomeLevel", "multiChild", "neighborhood", "updatedAt", "userId") SELECT "childCount", "city", "createdAt", "district", "dualIncome", "id", "incomeLevel", "multiChild", "neighborhood", "updatedAt", "userId" FROM "UserProfile";
DROP TABLE "UserProfile";
ALTER TABLE "new_UserProfile" RENAME TO "UserProfile";
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
