-- AlterTable
ALTER TABLE "Module" ADD COLUMN "createdById" TEXT;

-- CreateIndex (optional, for performance)
CREATE INDEX "Module_createdById_idx" ON "Module"("createdById");
