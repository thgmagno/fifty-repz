-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "username" TEXT;

-- Backfill: usuários existentes recebem um username provisório baseado no id,
-- que eles podem trocar depois em /perfil/editar.
UPDATE "User" SET "username" = 'user-' || substring("id" from 1 for 8) WHERE "username" IS NULL;

ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
