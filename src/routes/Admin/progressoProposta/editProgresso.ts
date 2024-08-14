import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../lib/prisma";
import { autenticarToken } from "../user/login";

const requestParamsSchema = z.object({
  id: z.string().uuid(),
  idProgresso: z.string()
});

const requestBodySchema = z.object({
  descricao: z.string(),
});

export async function editProgressoProposta(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/proposta/:id/progresso/:idProgresso",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Edit Progresso Proposta",
        headers: z.object({
          authorization: z.string()
        }),
        tags: ["Progresso Proposta"],
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
      const { descricao } = requestBodySchema.parse(request.body);
      const { id, idProgresso } = requestParamsSchema.parse(request.params);

      const progresso = await prisma.progresso.update({
        where: {
          id: Number(idProgresso),
          propostaId: id
        },
        data: {
          descricao
        }
      });

      if (!progresso) {
        return reply
          .status(400)
          .send({ message: "Erro ao editar progresso da proposta" });
      }

      return reply.status(200).send({
        message: "Progresso da proposta editado com sucesso"
      });
    }
  );
}