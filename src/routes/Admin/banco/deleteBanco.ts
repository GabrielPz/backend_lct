import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../lib/prisma";
import { z } from "zod";
import { autenticarToken } from "../user/login";

const paramsSchema = z.object({
  bancoId: z.string().uuid()
});

export async function deleteBancoParaAdmin(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/banco/:bancoId",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Delete Banco",
        tags: ["Banco"],
        params: paramsSchema,
        headers: z.object({
          authorization: z.string()
        }),
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
      const { bancoId } = paramsSchema.parse(request.params);

      const banco = await prisma.banco.delete({
        where: {
          id: bancoId
        }
      });

      if (!banco) {
        return reply.status(400).send({ message: "Banco não encontrado" });
      }

      return reply.status(200).send({ message: "Banco deletado com sucesso" });
    }
  );
}