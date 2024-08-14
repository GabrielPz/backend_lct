import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../lib/prisma";
import { autenticarToken } from "../user/login";

export async function getAllItemProposta (app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/itemProposta",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Get All ItemProposta",
        tags: ["ItemProposta"],
        headers: z.object({
          authorization: z.string()
        }),
        response: {
          200: z.array(
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
              produtoManufaturado: z.boolean(),
              criterioJulgamento: z.string(),
              propostaId: z.string()
            })
          ),
          400: z.object({
            message: z.string()
          })
        }
      }
    },
    async (request, reply) => {
      const itemProposta = await prisma.itemProposta.findMany();

      if (!itemProposta) {
        return reply
          .status(400)
          .send({ message: "Erro ao buscar itemProposta" });
      }

      return reply.status(200).send(itemProposta);
    }
  );
};