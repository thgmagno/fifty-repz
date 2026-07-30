-- AlterTable
ALTER TABLE "WorkoutTemplate" ADD COLUMN     "programLevelId" TEXT;

-- CreateTable
CREATE TABLE "WorkoutProgram" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutProgramLevel" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unlockThreshold" INTEGER NOT NULL DEFAULT 50,

    CONSTRAINT "WorkoutProgramLevel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutProgram_slug_key" ON "WorkoutProgram"("slug");

-- CreateIndex
CREATE INDEX "WorkoutProgramLevel_programId_idx" ON "WorkoutProgramLevel"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutProgramLevel_programId_level_key" ON "WorkoutProgramLevel"("programId", "level");

-- CreateIndex
CREATE INDEX "WorkoutTemplate_programLevelId_idx" ON "WorkoutTemplate"("programLevelId");

-- AddForeignKey
ALTER TABLE "WorkoutTemplate" ADD CONSTRAINT "WorkoutTemplate_programLevelId_fkey" FOREIGN KEY ("programLevelId") REFERENCES "WorkoutProgramLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutProgramLevel" ADD CONSTRAINT "WorkoutProgramLevel_programId_fkey" FOREIGN KEY ("programId") REFERENCES "WorkoutProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
