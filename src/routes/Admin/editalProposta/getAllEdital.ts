import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../lib/prisma";
import moment from "moment-timezone";
import { autenticarToken } from "../user/login";
import { z } from "zod";

const requestParamsSchema = z.object({
  propostaId: z.string().uuid()
});

export async function editalGetAll(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/editalProposta/:propostaId",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Get All Edital by PropostaId",
        headers: z.object({
          authorization: z.string()
        }),
        tags: ["EditalProposta"],
        params: requestParamsSchema,
        response: {
          200: z.array(
            z.object({
              id: z.string().uuid(),
              titulo: z.string(),
              status: z.boolean(),
              nome: z.string(),
              descricao: z.string(),
              dataPublicacaoPNCP: z.string(),
              sequencialEdital: z.number(),
              cnpj: z.string(),
              ano: z.number(),
              url: z.string()
            })
          ),
          400: z.object({
            message: z.string()
          })
        }
      }
    },
    async (request, reply) => {
      const { propostaId } = requestParamsSchema.parse(request.params);

      const edital = await prisma.editalProposta.findMany({
        where: {
          propostaId
        },
        select: {
          id: true,
          titulo: true,
          status: true,
          nome: true,
          descricao: true,
          dataPublicacaoPNCP: true,
          sequencialEdital: true,
          cnpj: true,
          ano: true,
          url: true
        }
      });

      if (!edital) {
        return reply.status(400).send({ message: "Error on get Edital" });
      }

      const editalResponse = edital.map((edital) => ({
        id: edital.id,
        titulo: edital.titulo,
        status: edital.status,
        nome: edital.nome,
        descricao: edital.descricao,
        dataPublicacaoPNCP: moment
          .tz(edital.dataPublicacaoPNCP, "America/Sao_Paulo")
          .format("YYYY-MM-DD HH:mm:ss"),
        sequencialEdital: edital.sequencialEdital,
        cnpj: edital.cnpj,
        ano: edital.ano,
        url: edital.url
      }));

      reply.send(editalResponse);
    }
  );
}
