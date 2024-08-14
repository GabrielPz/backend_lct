import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../lib/prisma";
import { autenticarToken } from "../user/login";

const requestParamsSchema = z.object({
  id: z.string().uuid(),
  idProgresso: z.number()
});

export async function deleteProgressoProposta(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/proposta/:id/progresso/:idProgresso",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Delete Progresso Proposta",
        headers: z.object({
          authorization: z.string()
        }),
        tags: ["Progresso Proposta"],
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
      const { id, idProgresso } = requestParamsSchema.parse(request.params);

      const progresso = await prisma.progresso.delete({
        where: {
          id: idProgresso,
          propostaId: id
        }
      });

      if (!progresso) {
        return reply
          .status(400)
          .send({ message: "Erro ao deletar progresso da proposta" });
      }

      return reply.status(200).send({
        message: "Progresso da proposta deletado com sucesso"
      });
    }
  );
}