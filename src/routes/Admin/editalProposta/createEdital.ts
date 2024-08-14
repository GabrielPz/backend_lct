import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../lib/prisma";
import { autenticarToken } from "../user/login";
import { z } from "zod";

const requestBodySchema = z.object({
  titulo: z.string(),
  status: z.boolean(),
  nome: z.string(),
  descricao: z.string(),
  dataPublicacaoPNCP: z.string(),
  sequencialEdital: z.number(),
  cnpj: z.string(),
  ano: z.number(),
  url: z.string(),
  propostaId: z.string()
});

export async function createEdital(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/editalProposta",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Create Edital",
        headers: z.object({
          authorization: z.string()
        }),
        tags: ["EditalProposta"],
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
      const {
        titulo,
        status,
        nome,
        descricao,
        dataPublicacaoPNCP,
        sequencialEdital,
        cnpj,
        ano,
        url,
        propostaId
      } = requestBodySchema.parse(request.body);

      const edital = await prisma.editalProposta.create({
        data: {
          titulo,
          status,
          nome,
          descricao,
          dataPublicacaoPNCP,
          sequencialEdital,
          cnpj,
          ano,
          url,
          propostaId
        }
      });

      if (!edital) {
        return reply.status(400).send({ message: "Edital not found" });
      }

      reply.send({ message: "Edital created" });
    }
  );
}
