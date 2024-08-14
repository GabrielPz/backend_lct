import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../lib/prisma";
import { autenticarToken } from "../user/login";

const requestParamsSchema = z.object({
  id: z.string().uuid()
});

export async function readItemProposta(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/itemProposta/:id/read",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Edit ItemProposta",
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
      const { id } = requestParamsSchema.parse(request.params);

      const itemProposta = await prisma.fornecedorItemProposta.update({
        where: {
          id
        },
        data: {
          isRead: true
        }
      });

      if (!itemProposta) {
        return reply
          .status(400)
          .send({ message: "Erro ao ler a proposta" });
      }

      return reply.status(200).send({
        message: "Proposta lida com sucesso"
      });
    }
  );
}
