import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../lib/prisma";
import { autenticarToken } from "../user/login";

interface ItemPropostaUpdateData {
  numeroItem?: number;
  descricao?: string;
  valorUnitarioEstimado?: number;
  valorTotalEstimado?: number;
  quantidade?: number;
  unidadeMedida?: string;
  tipo?: string;
  categoria?: string;
  beneficios?: string;
  situacao?: string;
  produtoManufaturado?: boolean;
  criterioJulgamento?: string;
}

const requestParamsSchema = z.object({
  id: z.string().uuid()
});

const requestBodySchema = z.object({
  numeroItem: z.number().optional(),
  descricao: z.string().optional(),
  valorUnitarioEstimado: z.number().optional(),
  valorTotalEstimado: z.number().optional(),
  quantidade: z.number().optional(),
  unidadeMedida: z.string().optional(),
  tipo: z.string().optional(),
  categoria: z.string().optional(),
  beneficios: z.string().optional(),
  situacao: z.string().optional(),
  produtoManufaturado: z.boolean().optional(),
  criterioJulgamento: z.string().optional(),
});

export async function editItemProposta(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/itemProposta/:id",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Edit ItemProposta",
        tags: ["ItemProposta"],
        headers: z.object({
          authorization: z.string()
        }),
        params: requestParamsSchema,
        body: requestBodySchema,
        response: {
          200: z.object({
            message: z.string()
          }),
          400: z.object({
            message: z.string()
          })
        }
      }
    },
    async (request, reply) => {
      const { id } = requestParamsSchema.parse(request.params);
      const {
        numeroItem,
        descricao,
        valorUnitarioEstimado,
        valorTotalEstimado,
        quantidade,
        unidadeMedida,
        tipo,
        categoria,
        beneficios,
        situacao,
        produtoManufaturado,
        criterioJulgamento
      } = requestBodySchema.parse(request.body);

      const updateData: ItemPropostaUpdateData = {};

      if (numeroItem && numeroItem != null) {
        updateData.numeroItem = numeroItem;
      }
      if (descricao && descricao != null) {
        updateData.descricao = descricao;
      }
      if (valorUnitarioEstimado && valorUnitarioEstimado != null) {
        updateData.valorUnitarioEstimado = valorUnitarioEstimado;
      }
      if (valorTotalEstimado && valorTotalEstimado != null) {
        updateData.valorTotalEstimado = valorTotalEstimado;
      }
      if (quantidade && quantidade != null) {
        updateData.quantidade = quantidade;
      }
      if (unidadeMedida && unidadeMedida != null) {
        updateData.unidadeMedida = unidadeMedida;
      }
      if (tipo && tipo != null) {
        updateData.tipo = tipo;
      }
      if (categoria && categoria != null) {
        updateData.categoria = categoria;
      }
      if (beneficios && beneficios != null) {
        updateData.beneficios = beneficios;
      }
      if (situacao && situacao != null) {
        updateData.situacao = situacao;
      }
      if (produtoManufaturado && produtoManufaturado != null) {
        updateData.produtoManufaturado = produtoManufaturado;
      }
      if (criterioJulgamento && criterioJulgamento != null) {
        updateData.criterioJulgamento = criterioJulgamento;
      }

      const itemProposta = await prisma.itemProposta.update({
        where: {
          id
        },
        data: updateData
      });

      if (!itemProposta) {
        return reply
          .status(400)
          .send({ message: "Erro ao editar itemProposta" });
      }

      return reply.status(200).send({
        message: "ItemProposta editada com sucesso"
      });
    }
  );
}
