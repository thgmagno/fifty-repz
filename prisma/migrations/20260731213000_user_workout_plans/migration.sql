-- AlterTable: planos passam a poder ter dono (null = plano oficial do seed)
ALTER TABLE "WorkoutProgram" ADD COLUMN     "ownerId" TEXT;

-- slug é a chave estável do seed, então só existe nos planos oficiais
ALTER TABLE "WorkoutProgram" ALTER COLUMN "slug" DROP NOT NULL;

-- AlterTable: treino do usuário aponta direto para o plano dele
-- (o treino oficial continua chegando ao plano pelo nível)
ALTER TABLE "WorkoutTemplate" ADD COLUMN     "programId" TEXT;

-- CreateIndex
CREATE INDEX "WorkoutProgram_ownerId_idx" ON "WorkoutProgram"("ownerId");

-- CreateIndex
CREATE INDEX "WorkoutTemplate_programId_idx" ON "WorkoutTemplate"("programId");

-- AddForeignKey
ALTER TABLE "WorkoutProgram" ADD CONSTRAINT "WorkoutProgram_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutTemplate" ADD CONSTRAINT "WorkoutTemplate_programId_fkey" FOREIGN KEY ("programId") REFERENCES "WorkoutProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: treinos avulsos deixam de existir. Cada usuário que tinha
-- treinos soltos ganha um plano "Meus treinos" com todos eles dentro.
INSERT INTO "WorkoutProgram" ("id", "name", "description", "ownerId", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  'Meus treinos',
  'Treinos que você montou antes dos planos existirem.',
  "User"."id",
  now(),
  now()
FROM "User"
WHERE EXISTS (
  SELECT 1 FROM "WorkoutTemplate"
  WHERE "WorkoutTemplate"."ownerId" = "User"."id"
    AND "WorkoutTemplate"."programId" IS NULL
);

UPDATE "WorkoutTemplate"
SET "programId" = "WorkoutProgram"."id"
FROM "WorkoutProgram"
WHERE "WorkoutProgram"."ownerId" = "WorkoutTemplate"."ownerId"
  AND "WorkoutTemplate"."ownerId" IS NOT NULL
  AND "WorkoutTemplate"."programId" IS NULL;
