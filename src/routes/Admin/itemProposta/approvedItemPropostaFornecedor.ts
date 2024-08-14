import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../lib/prisma";
import { autenticarToken } from "../user/login";

const requestParamsSchema = z.object({
  id: z.string().uuid(),
});

const requestBodySchema = z.object({
  isApproved: z.boolean(),
});

export async function approvedItemProposta(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/itemProposta/:id/approved",
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
      const { isApproved } = requestBodySchema.parse(request.body);

      const itemProposta = await prisma.fornecedorItemProposta.update({
        where: {
          id
        },
        data: {
          isApproved,
          isRead: true
        }
      });

      if (!itemProposta) {
        return reply.status(400).send({ message: "Erro ao atualizar Proposta de Item" });
      }

      return reply.status(200).send({
        message: "Proposta de Item Atualizada com sucesso"
      });
    }
  );
}
