-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profile_photo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fornecedores" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "logradouro" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "banco" TEXT NOT NULL,
    "agencia" TEXT NOT NULL,
    "conta" TEXT NOT NULL,
    "tipo_de_conta" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fornecedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area_atuacao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "fornecedorId" TEXT,

    CONSTRAINT "area_atuacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "editais" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "id_contratacao_pncp" TEXT NOT NULL,
    "modalidade_da_contratacao" TEXT NOT NULL,
    "ultima_atualizacao" TIMESTAMP(3) NOT NULL,
    "orgao" TEXT NOT NULL,
    "local" TEXT NOT NULL,
    "objeto" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "fornecedorId" TEXT NOT NULL,

    CONSTRAINT "editais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_editais" (
    "id" TEXT NOT NULL,
    "numeroItem" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor_unitario_estimado" DOUBLE PRECISION NOT NULL,
    "valor_total_estimado" DOUBLE PRECISION NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "unidade_medida" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "beneficios" TEXT NOT NULL,
    "situacao" TEXT NOT NULL,
    "produto_manufaturado" BOOLEAN NOT NULL,
    "criterio_julgamento" TEXT NOT NULL,
    "sigiloso" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "propostaId" TEXT NOT NULL,

    CONSTRAINT "item_editais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "edital_propostas" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "data_publicacao_pncp" TIMESTAMP(3) NOT NULL,
    "sequencial_edital" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "ano" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "propostaId" TEXT NOT NULL,

    CONSTRAINT "edital_propostas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progressos" (
    "id" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "propostaId" TEXT,

    CONSTRAINT "progressos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedores_email_key" ON "fornecedores"("email");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedores_cnpj_key" ON "fornecedores"("cnpj");

-- AddForeignKey
ALTER TABLE "area_atuacao" ADD CONSTRAINT "area_atuacao_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editais" ADD CONSTRAINT "editais_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_editais" ADD CONSTRAINT "item_editais_propostaId_fkey" FOREIGN KEY ("propostaId") REFERENCES "editais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edital_propostas" ADD CONSTRAINT "edital_propostas_propostaId_fkey" FOREIGN KEY ("propostaId") REFERENCES "editais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progressos" ADD CONSTRAINT "progressos_propostaId_fkey" FOREIGN KEY ("propostaId") REFERENCES "editais"("id") ON DELETE SET NULL ON UPDATE CASCADE;
