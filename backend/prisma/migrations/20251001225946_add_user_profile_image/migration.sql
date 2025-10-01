-- AlterTable
ALTER TABLE "organizacoes" ALTER COLUMN "nome" SET DEFAULT 'Organização';

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "imagem_perfil" TEXT;
