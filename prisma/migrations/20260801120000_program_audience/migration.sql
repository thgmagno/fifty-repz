-- CreateEnum
CREATE TYPE "ProgramAudience" AS ENUM ('MALE', 'FEMALE');

-- AlterTable: cada plano oficial passa a atender um público
ALTER TABLE "WorkoutProgram" ADD COLUMN     "audience" "ProgramAudience";

-- AlterTable: e cada usuário guarda em qual versão se matriculou
ALTER TABLE "User" ADD COLUMN     "programAudience" "ProgramAudience";

-- Backfill: o plano que está no ar foi montado para o público masculino.
-- As sessões já registradas seguem apontando para os mesmos treinos.
UPDATE "WorkoutProgram" SET "audience" = 'MALE' WHERE "slug" = 'fifty-repz';

-- Backfill: quem já treinou no plano oficial não pode ser interrompido por
-- uma pergunta nova — fica matriculado na versão que existia até aqui.
UPDATE "User"
SET "programAudience" = 'MALE'
WHERE EXISTS (
  SELECT 1
  FROM "WorkoutSession"
  JOIN "WorkoutTemplate" ON "WorkoutTemplate"."id" = "WorkoutSession"."templateId"
  JOIN "WorkoutProgramLevel" ON "WorkoutProgramLevel"."id" = "WorkoutTemplate"."programLevelId"
  JOIN "WorkoutProgram" ON "WorkoutProgram"."id" = "WorkoutProgramLevel"."programId"
  WHERE "WorkoutSession"."userId" = "User"."id"
    AND "WorkoutProgram"."audience" = 'MALE'
);
