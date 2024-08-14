import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../lib/prisma";
import { autenticarToken } from "../user/login";
import { z } from "zod";

const requestParamsSchema = z.object({
  propostaId: z.string().uuid()
});

const requestResponseSchema = z.array(
  z.object({
    id: z.string(),
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
    isApproved: z.boolean(),
    produtoManufaturado: z.boolean(),
    criterioJulgamento: z.string(),
    propostaId: z.string(),
    fornecedorItemProposta: 
        z.object({
          id: z.string(),
          valorUnitarioEstimado: z.number(),
          valorTotalEstimado: z.number(),
          quantidade: z.number(),
          itemPropostaId: z.string(),
          propostaId: z.string(),
          fornecedorId: z.string(),
          isApproved: z.boolean()
        })
      .optional().nullish()
  })
);

export async function getAllItemByProposta(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/itemProposta/:propostaId",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Get All ItemProposta by PropostaId",
        tags: ["ItemProposta"],
        headers: z.object({
          authorization: z.string()
        }),
        params: requestParamsSchema,
        response: {
          200: requestResponseSchema,
          400: z.object({
            message: z.string()
          })
        }
      }
    },
    async (request, reply) => {
      const { propostaId } = request.params;

      const itemProposta = await prisma.itemProposta.findMany({
        where: {
          propostaId
        },
        select: {
          id: true,
          numeroItem: true,
          descricao: true,
          valorUnitarioEstimado: true,
          valorTotalEstimado: true,
          quantidade: true,
          unidadeMedida: true,
          tipo: true,
          categoria: true,
          beneficios: true,
          situacao: true,
          isApproved: true,
          produtoManufaturado: true,
          criterioJulgamento: true,
          propostaId: true,
          fornecedorItemProposta: {
            select: {
              id: true,
              valorUnitarioEstimado: true,
              valorTotalEstimado: true,
              quantidade: true,
              itemPropostaId: true,
              propostaId: true,
              fornecedorId: true,
              isApproved: true
            }
          }
        }
      });

      if (!itemProposta || itemProposta.length === 0) {
        return reply
          .status(400)
          .send({ message: "Erro ao buscar itemProposta" });
      }

      return reply.status(200).send(requestResponseSchema.parse(itemProposta));
    }
  );
};
