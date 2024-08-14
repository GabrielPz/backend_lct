import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../lib/prisma";
import { autenticarToken } from "../user/login";
import { z } from "zod";

const requestParamsSchema = z.object({
  id: z.string().uuid()
});

export async function deleteProposta(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/proposta/:id",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Delete Proposta",
        headers: z.object({
          authorization: z.string()
        }),
        tags: ["Proposta"],
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

      await prisma.itemProposta.deleteMany({
        where: {
          propostaId: id
        }
      });

      await prisma.editalProposta.deleteMany({
        where: {
          propostaId: id
        }
      });

      await prisma.progresso.deleteMany({
        where: {
          propostaId: id
        }
      });

      const proposta = await prisma.proposta.delete({
        where: {
          id
        }
      });

      if (!proposta) {
        return reply.status(400).send({ message: "Erro ao deletar proposta" });
      }

      return reply.status(200).send({
        message: "Proposta deletada com sucesso"
      });
    }
  );
}
