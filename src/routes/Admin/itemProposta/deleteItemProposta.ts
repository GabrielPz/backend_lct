import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../lib/prisma";
import { autenticarToken } from "../user/login";

const requestParamsSchema = z.object({
  id: z.string().uuid(),
});

export async function deleteItemProposta(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/itemProposta/:id",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Delete ItemProposta",
        tags: ["ItemProposta"],
        headers: z.object({
          authorization: z.string(),
        }),
        params: requestParamsSchema,
        response: {
          200: z.object({
            message: z.string(),
          }),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = requestParamsSchema.parse(request.params);

      const itemProposta = await prisma.itemProposta.delete({
        where: {
          id,
        },
      });

      if (!itemProposta) {
        return reply
          .status(400)
          .send({ message: "Erro ao deletar itemProposta" });
      }

      return reply.status(200).send({
        message: "ItemProposta deletada com sucesso",
      });
    }
  );
}
