import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../lib/prisma";
import { autenticarToken } from "../user/login";

const requestBodySchema = z.object({
  descricao: z.string(),
  propostaId: z.string().uuid(),
});

export async function createProgressoProposta(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/proposta/:id/progresso",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Create Progresso Proposta",
        headers: z.object({
          authorization: z.string()
        }),
        tags: ["Progresso Proposta"],
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
      const { descricao, propostaId } = requestBodySchema.parse(request.body);

      const progresso = await prisma.progresso.create({
        data: {
          descricao,
          propostaId
        }
      });

      if (!progresso) {
        return reply
          .status(400)
          .send({ message: "Erro ao criar progresso da proposta" });
      }

      return reply.status(200).send({
        message: "Progresso da proposta criado com sucesso"
      });
    }
  );
}