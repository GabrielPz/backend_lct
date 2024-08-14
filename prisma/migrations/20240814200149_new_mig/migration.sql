/*
  Warnings:

  - Added the required column `estado` to the `editais` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pncp_id` to the `editais` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "editais" ADD COLUMN     "estado" TEXT NOT NULL,
ADD COLUMN     "pncp_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "item_editais" ADD COLUMN     "is_approved" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "forgot_password_admin" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expire_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "fornecedorId" TEXT,

    CONSTRAINT "forgot_password_admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bancos" (
    "id" TEXT NOT NULL,
    "banco" TEXT NOT NULL,
    "agencia" TEXT NOT NULL,
    "conta" TEXT NOT NULL,
    "tipo_de_conta" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "bancos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aprovacao_login_fornecedor" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expire_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "fornecedorId" TEXT,

    CONSTRAINT "aprovacao_login_fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_propostas" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "propostaId" TEXT NOT NULL,
    "is_sent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_propostas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fornecedor_item_editais" (
    "id" TEXT NOT NULL,
    "valor_unitario_estimado" DOUBLE PRECISION NOT NULL,
    "valor_total_estimado" DOUBLE PRECISION NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "propostaId" TEXT NOT NULL,
    "item_proposta_id" TEXT NOT NULL,
    "fornecedor_id" TEXT NOT NULL,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "notificacao_approved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fornecedor_item_editais_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "forgot_password_admin_userId_key" ON "forgot_password_admin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "forgot_password_admin_fornecedorId_key" ON "forgot_password_admin"("fornecedorId");

-- CreateIndex
CREATE UNIQUE INDEX "aprovacao_login_fornecedor_fornecedorId_key" ON "aprovacao_login_fornecedor"("fornecedorId");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedor_item_editais_item_proposta_id_key" ON "fornecedor_item_editais"("item_proposta_id");

-- AddForeignKey
ALTER TABLE "forgot_password_admin" ADD CONSTRAINT "forgot_password_admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forgot_password_admin" ADD CONSTRAINT "forgot_password_admin_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bancos" ADD CONSTRAINT "bancos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aprovacao_login_fornecedor" ADD CONSTRAINT "aprovacao_login_fornecedor_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_propostas" ADD CONSTRAINT "email_propostas_propostaId_fkey" FOREIGN KEY ("propostaId") REFERENCES "editais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fornecedor_item_editais" ADD CONSTRAINT "fornecedor_item_editais_propostaId_fkey" FOREIGN KEY ("propostaId") REFERENCES "editais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fornecedor_item_editais" ADD CONSTRAINT "fornecedor_item_editais_item_proposta_id_fkey" FOREIGN KEY ("item_proposta_id") REFERENCES "item_editais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fornecedor_item_editais" ADD CONSTRAINT "fornecedor_item_editais_fornecedor_id_fkey" FOREIGN KEY ("fornecedor_id") REFERENCES "fornecedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
