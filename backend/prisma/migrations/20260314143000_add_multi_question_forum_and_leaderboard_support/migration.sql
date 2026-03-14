ALTER TABLE "ClassExercise" ADD COLUMN "questionSet" TEXT;

ALTER TABLE "ExerciseAttempt" ADD COLUMN "questionResults" TEXT;

CREATE TABLE "ClassDiscussionThread" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "classId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    CONSTRAINT "ClassDiscussionThread_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClassDiscussionThread_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "ClassDiscussionReply" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "threadId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    CONSTRAINT "ClassDiscussionReply_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ClassDiscussionThread" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClassDiscussionReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "ClassDiscussionThread_classId_createdAt_idx" ON "ClassDiscussionThread"("classId", "createdAt");
CREATE INDEX "ClassDiscussionReply_threadId_createdAt_idx" ON "ClassDiscussionReply"("threadId", "createdAt");
