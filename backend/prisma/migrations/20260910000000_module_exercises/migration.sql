-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClassExercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "exerciseType" TEXT NOT NULL DEFAULT 'geometry',
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "points" INTEGER NOT NULL DEFAULT 10,
    "hasTimer" BOOLEAN NOT NULL DEFAULT false,
    "timerMinutes" INTEGER,
    "canvasState" TEXT,
    "canvasMode" TEXT NOT NULL DEFAULT 'readonly',
    "answerType" TEXT NOT NULL DEFAULT 'multiple_choice',
    "correctAnswer" TEXT,
    "options" TEXT,
    "questionSet" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "classId" TEXT NOT NULL,
    "moduleId" TEXT,
    "moduleOrder" INTEGER,
    CONSTRAINT "ClassExercise_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClassExercise_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ClassExercise" ("answerType", "canvasMode", "canvasState", "classId", "correctAnswer", "createdAt", "description", "difficulty", "exerciseType", "hasTimer", "id", "instructions", "isPublished", "options", "order", "points", "questionSet", "timerMinutes", "title", "updatedAt") SELECT "answerType", "canvasMode", "canvasState", "classId", "correctAnswer", "createdAt", "description", "difficulty", "exerciseType", "hasTimer", "id", "instructions", "isPublished", "options", "order", "points", "questionSet", "timerMinutes", "title", "updatedAt" FROM "ClassExercise";
DROP TABLE "ClassExercise";
ALTER TABLE "new_ClassExercise" RENAME TO "ClassExercise";
CREATE TABLE "new_Material" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'Mudah',
    "content" TEXT,
    "semester" INTEGER NOT NULL DEFAULT 1,
    "grade" INTEGER NOT NULL DEFAULT 7,
    "moduleId" TEXT,
    "moduleOrder" INTEGER,
    "linkedQuizId" TEXT,
    "minPassingScore" INTEGER DEFAULT 70,
    "order" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "Material_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Material_linkedQuizId_fkey" FOREIGN KEY ("linkedQuizId") REFERENCES "Material" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Material_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Material" ("category", "content", "createdAt", "createdById", "grade", "id", "level", "linkedQuizId", "minPassingScore", "moduleId", "moduleOrder", "order", "semester", "title", "type", "updatedAt") SELECT "category", "content", "createdAt", "createdById", "grade", "id", "level", "linkedQuizId", "minPassingScore", "moduleId", "moduleOrder", "order", "semester", "title", "type", "updatedAt" FROM "Material";
DROP TABLE "Material";
ALTER TABLE "new_Material" RENAME TO "Material";
CREATE TABLE "new_Module" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "grade" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "classId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Module_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Module_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Module" ("classId", "createdAt", "createdById", "description", "grade", "id", "order", "semester", "subject", "title", "updatedAt") SELECT "classId", "createdAt", "createdById", "description", "grade", "id", "order", "semester", "subject", "title", "updatedAt" FROM "Module";
DROP TABLE "Module";
ALTER TABLE "new_Module" RENAME TO "Module";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

