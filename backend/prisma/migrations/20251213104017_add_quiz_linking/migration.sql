-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Material" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'Mudah',
    "content" TEXT,
    "semester" INTEGER NOT NULL DEFAULT 1,
    "grade" INTEGER NOT NULL DEFAULT 10,
    "linkedQuizId" TEXT,
    "minPassingScore" INTEGER DEFAULT 70,
    "order" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "Material_linkedQuizId_fkey" FOREIGN KEY ("linkedQuizId") REFERENCES "Material" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Material_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Material" ("category", "content", "createdAt", "createdById", "grade", "id", "level", "semester", "title", "type", "updatedAt") SELECT "category", "content", "createdAt", "createdById", "grade", "id", "level", "semester", "title", "type", "updatedAt" FROM "Material";
DROP TABLE "Material";
ALTER TABLE "new_Material" RENAME TO "Material";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
