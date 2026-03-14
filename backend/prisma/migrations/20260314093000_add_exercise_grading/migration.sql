ALTER TABLE "ExerciseAttempt" ADD COLUMN "gradingStatus" TEXT NOT NULL DEFAULT 'graded';
ALTER TABLE "ExerciseAttempt" ADD COLUMN "feedback" TEXT;
ALTER TABLE "ExerciseAttempt" ADD COLUMN "gradedAt" DATETIME;
