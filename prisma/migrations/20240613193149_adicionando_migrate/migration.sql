/*
  Warnings:

  - Added the required column `url` to the `edital_propostas` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `sequencial_edital` on the `edital_propostas` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `password` to the `fornecedores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "edital_propostas" ADD COLUMN     "url" TEXT NOT NULL,
DROP COLUMN "sequencial_edital",
ADD COLUMN     "sequencial_edital" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "fornecedores" ADD COLUMN     "password" TEXT NOT NULL;
