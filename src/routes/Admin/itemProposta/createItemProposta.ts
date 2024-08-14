import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../lib/prisma";
import { autenticarToken } from "../user/login";

const requestBodySchema = z.object({
  numeroItem: z.number(),
  descricao: z.string(),
  valorUnitarioEstimado: z.number(),
  valorTotalEstimado: z.number(),
  quantidade: z.number(),
  unidadeMedida: z.string(),
  tipo: z.string(),
  categoria: z.string(),
  beneficios: z.string(),
  situacao: z.string(),
  produtoManufaturado: z.boolean(),
  criterioJulgamento: z.string(),
  propostaId: z.string().uuid()
});

const requestParamsSchema = z.object({
  propostaId: z.string().uuid()
});

export async function createItemProposta(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/itemProposta/:propostaId",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Create ItemProposta",
        tags: ["ItemProposta"],
        headers: z.object({
          authorization: z.string()
        }),
        params: requestParamsSchema,
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
      const { propostaId } = requestParamsSchema.parse(request.params);
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

      const itemProposta = await prisma.itemProposta.create({
        data: {
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
          criterioJulgamento,
          propostaId
        }
      });

      if (!itemProposta) {
        return reply
          .status(400)
          .send({ message: "Erro ao deletar itemProposta" });
      }

      return reply.status(200).send({
        message: "ItemProposta deletada com sucesso"
      });
    }
  );
}