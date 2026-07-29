-- CreateEnum
CREATE TYPE "MuscleGroup" AS ENUM ('ABDOMINALS', 'ABDUCTORS', 'ADDUCTORS', 'BICEPS', 'CALVES', 'CHEST', 'FOREARMS', 'GLUTES', 'HAMSTRINGS', 'LATS', 'LOWER_BACK', 'MIDDLE_BACK', 'NECK', 'QUADRICEPS', 'SHOULDERS', 'TRAPS', 'TRICEPS');

-- CreateEnum
CREATE TYPE "Equipment" AS ENUM ('BARBELL', 'DUMBBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT', 'KETTLEBELL', 'EZ_BAR', 'BANDS', 'MEDICINE_BALL', 'EXERCISE_BALL', 'OTHER');

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "muscleGroup" "MuscleGroup" NOT NULL,
    "secondaryMuscles" "MuscleGroup"[],
    "equipment" "Equipment" NOT NULL,
    "imageUrls" TEXT[],
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_slug_key" ON "Exercise"("slug");

-- CreateIndex
CREATE INDEX "Exercise_muscleGroup_idx" ON "Exercise"("muscleGroup");

-- CreateIndex
CREATE INDEX "Exercise_ownerId_idx" ON "Exercise"("ownerId");

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

