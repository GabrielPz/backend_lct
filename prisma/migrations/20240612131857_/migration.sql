/*
  Warnings:

  - Changed the type of `ano` on the `edital_propostas` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `propostaId` on table `progressos` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "progressos" DROP CONSTRAINT "progressos_propostaId_fkey";

-- AlterTable
ALTER TABLE "edital_propostas" DROP COLUMN "ano",
ADD COLUMN     "ano" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "progressos" ALTER COLUMN "propostaId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "progressos" ADD CONSTRAINT "progressos_propostaId_fkey" FOREIGN KEY ("propostaId") REFERENCES "editais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
