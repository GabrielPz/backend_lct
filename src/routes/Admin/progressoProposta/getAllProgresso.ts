import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../lib/prisma";
import moment from "moment-timezone";
import { autenticarToken } from "../user/login";
import { z } from "zod";

const requestParamsSchema = z.object({
  id: z.string().uuid()
});

export async function getAllProgressoProposta(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/proposta/:id/progresso",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Get All Progresso Proposta",
        headers: z.object({
          authorization: z.string()
        }),
        tags: ["Progresso Proposta"],
        params: requestParamsSchema,
        response: {
          200: z.array(
            z.object({
              id: z.number(),
              descricao: z.string(),
              propostaId: z.string(),
              createdAt: z.string(),
              updatedAt: z.string()
            })
          ),
          400: z.object({
            message: z.string()
          })
        }
      }
    },
    async (request, reply) => {
      const { id } = requestParamsSchema.parse(request.params);

      const progresso = await prisma.progresso.findMany({
        where: {
          propostaId: id
        },
        select: {
          id: true,
          descricao: true,
          propostaId: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!progresso) {
        return reply
          .status(400)
          .send({ message: "Erro ao buscar progresso da proposta" });
      }

      const transformedProgresso = progresso.map((item) => ({
        id: item.id,
        descricao: item.descricao,
        propostaId: item.propostaId,
        createdAt: moment
          .tz(item.createdAt, "America/Sao_Paulo")
          .format("DD/MM/YYYY HH:mm:ss"),
        updatedAt: moment
          .tz(item.updatedAt, "America/Sao_Paulo")
          .format("DD/MM/YYYY HH:mm:ss")
      }));

      return reply.status(200).send(transformedProgresso);
    }
  );
}
