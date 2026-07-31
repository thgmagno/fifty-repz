-- CreateEnum
CREATE TYPE "TrainingMode" AS ENUM ('PROGRAM', 'SOLO');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "onboardedAt" TIMESTAMP(3),
ADD COLUMN     "trainingMode" "TrainingMode";

-- Backfill: contas que já treinaram ou já montaram algum treino não precisam
-- ver a tela de boas-vindas — marcamos o onboarding como concluído usando a
-- data de criação da conta. Contas ainda vazias passam pelo onboarding no
-- próximo acesso.
UPDATE "User"
SET "onboardedAt" = "createdAt"
WHERE EXISTS (
  SELECT 1 FROM "WorkoutSession" WHERE "WorkoutSession"."userId" = "User"."id"
) OR EXISTS (
  SELECT 1 FROM "WorkoutTemplate" WHERE "WorkoutTemplate"."ownerId" = "User"."id"
);
